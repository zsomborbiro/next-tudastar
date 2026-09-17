import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { olvasasiPerc } from './cikk.ts'
import { gyujtCikkek, feloldKapcsolodo, kulcs } from './gyujtes.ts'
import { renderelCikk } from './render.ts'
import { ellenorizCikk, ellenorizTermek } from './szabalyok.ts'
import { TERMEKEK } from './termekek.ts'
import type { Cikk, Termekek } from './tipusok.ts'
import type { CikkJson, Health, IndexTetel, SitemapTetel } from './kimenet.ts'

const cikkUrl = (t: Termekek, c: Pick<Cikk, 'termek' | 'slug'>) => `${t[c.termek].domain}/tudastar/${c.slug}`

export function epitTermek(termek: string, cikkek: Cikk[], terkep: Map<string, Cikk>, termekek: Termekek) {
  const sajat = cikkek.filter((c) => c.termek === termek)
  const index: IndexTetel[] = sajat.map((c) => ({
    slug: c.slug, cim: c.cim, leiras: c.leiras, tema: c.tema, megjelent: c.megjelent,
    ...(c.frissitve ? { frissitve: c.frissitve } : {}), percek: olvasasiPerc(c), url: cikkUrl(termekek, c),
  }))
  const teljes: CikkJson[] = sajat.map((c, i) => {
    const { html, tartalomjegyzek } = renderelCikk(c)
    return {
      ...index[i], metaCim: c.metaCim ?? c.cim, bevezeto: c.bevezeto, html, tartalomjegyzek,
      ...(c.forrasok ? { forrasok: c.forrasok } : {}), ...(c.ellenorizve ? { ellenorizve: c.ellenorizve } : {}),
      kapcsolodo: c.kapcsolodo.map((k) => {
        const m = terkep.get(k)!
        return { termek: m.termek, nev: termekek[m.termek].nev, slug: m.slug, cim: m.cim, url: cikkUrl(termekek, m) }
      }),
      orgId: termekek[termek].orgId,
    }
  })
  const sitemap: SitemapTetel[] = sajat.map((c) => ({ url: cikkUrl(termekek, c), lastmod: c.frissitve ?? c.megjelent }))
  return { index, cikkek: teljes, sitemap }
}

/** A teljes build. Dob, ha bármi sérti a szabályokat — és akkor NEM ír ki semmit. */
export function build(opts: { cikkek: string; dist: string; most?: string; termekek?: Termekek }) {
  const termekek = opts.termekek ?? TERMEKEK
  const cikkek = gyujtCikkek(opts.cikkek, termekek)
  const terkep = feloldKapcsolodo(cikkek)
  const hibak = [
    ...cikkek.flatMap((c) => ellenorizCikk(c, termekek[c.termek])),
    ...Object.entries(termekek).flatMap(([k, t]) => ellenorizTermek(cikkek.filter((c) => c.termek === k), t)),
  ]
  if (hibak.length) throw new Error(`Őrző-szabálysértés:\n${hibak.join('\n')}`)

  rmSync(opts.dist, { recursive: true, force: true })
  const ir = (p: string, adat: unknown) => {
    mkdirSync(dirname(join(opts.dist, p)), { recursive: true })
    writeFileSync(join(opts.dist, p), JSON.stringify(adat))
  }
  for (const termek of Object.keys(termekek)) {
    const e = epitTermek(termek, cikkek, terkep, termekek)
    ir(`v1/${termek}/index.json`, e.index)
    ir(`v1/${termek}/sitemap.json`, e.sitemap)
    for (const c of e.cikkek) ir(`v1/${termek}/${c.slug}.json`, c)
  }
  const health: Health = { ok: true, cikkek: cikkek.length, termekek: Object.keys(termekek), build: opts.most ?? new Date().toISOString() }
  ir('v1/health.json', health)
  writeFileSync(join(opts.dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  console.log(`tudástár build: ${cikkek.length} cikk, ${Object.keys(termekek).length} termék → ${opts.dist}`)
  return { cikkek: cikkek.map(kulcs) }
}

// CLI: `tsx src/build.ts`
if (process.argv[1] && /build\.ts$/.test(process.argv[1])) {
  build({ cikkek: 'cikkek', dist: 'dist' })
}
