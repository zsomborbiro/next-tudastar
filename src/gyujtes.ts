import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { olvasCikk } from './cikk.ts'
import type { Cikk, Termekek } from './tipusok.ts'

export const kulcs = (c: Pick<Cikk, 'termek' | 'slug'>) => `${c.termek}/${c.slug}`

/**
 * `<gyoker>/<termek>/<slug>.md` → Cikk[]; determinisztikus sorrend, hogy a build
 * kimenete ugyanarra a bemenetre bájtra ugyanaz legyen.
 * `kihagy`: slugok, amiket nem olvasunk be (a rossz fixture-ökhöz a tesztekben).
 */
export function gyujtCikkek(gyoker: string, termekek: Termekek, opts: { kihagy?: string[] } = {}): Cikk[] {
  const kihagy = new Set(opts.kihagy ?? [])
  const cikkek: Cikk[] = []
  for (const termek of readdirSync(gyoker).sort()) {
    const mappa = join(gyoker, termek)
    if (!statSync(mappa).isDirectory()) continue
    if (!termekek[termek]) throw new Error(`${mappa}: nincs ilyen termék a termekek.json-ban`)
    for (const f of readdirSync(mappa).filter((f) => f.endsWith('.md')).sort()) {
      if (kihagy.has(f.replace(/\.md$/, ''))) continue
      const c = olvasCikk(join(mappa, f), termekek)
      if (c.termek !== termek) throw new Error(`${c.fajl}: a fejléc ${c.termek} terméket mond, de a ${termek} mappában van`)
      cikkek.push(c)
    }
  }
  return cikkek
}

/** A `kapcsolodo` hivatkozások ellenőrzése; a térkép kulcsa `termek/slug`. */
export function feloldKapcsolodo(cikkek: Cikk[]): Map<string, Cikk> {
  const terkep = new Map(cikkek.map((c) => [kulcs(c), c]))
  const hibak: string[] = []
  for (const c of cikkek) {
    if (c.kapcsolodo.length < 2) hibak.push(`${kulcs(c)}: legalább 2 kapcsolódó cikk kell`)
    if (new Set(c.kapcsolodo).size !== c.kapcsolodo.length) hibak.push(`${kulcs(c)}: ismétlődő kapcsolódó cikk`)
    for (const k of c.kapcsolodo) {
      if (k === kulcs(c)) hibak.push(`${kulcs(c)}: önmagára hivatkozik`)
      else if (!terkep.has(k)) hibak.push(`${kulcs(c)}: nem létező kapcsolódó cikk: ${k}`)
    }
  }
  if (hibak.length) throw new Error(hibak.join('\n'))
  return terkep
}
