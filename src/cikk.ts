import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import type { Cikk, Termekek } from './tipusok.ts'

const ISO = /^\d{4}-\d{2}-\d{2}$/

const FejlecSema = z.object({
  termek: z.string().regex(/^[a-z]+$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kisbetű, szám, kötőjel'),
  cim: z.string().min(10),
  metaCim: z.string().min(10).optional(),
  bevezeto: z.string().min(40),
  leiras: z.string().min(100, 'legalább 100 karakter').max(165, 'legfeljebb 165 karakter'),
  tema: z.enum(['jogszabaly', 'gyakorlat', 'penzugy']),
  megjelent: z.string().regex(ISO, 'YYYY-MM-DD'),
  frissitve: z.string().regex(ISO, 'YYYY-MM-DD').optional(),
  forrasok: z.array(z.object({ cim: z.string().min(6), url: z.string().regex(/^https:\/\//) })).optional(),
  ellenorizve: z.string().regex(ISO, 'YYYY-MM-DD').optional(),
  kapcsolodo: z.array(z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'termek/slug alak')),
})

/**
 * A YAML-fejléc dátumait a gray-matter Date objektummá alakítaná — a sémának
 * string kell (ISO), és a `frissitve <= ma` összehasonlítás is stringen megy.
 */
function datumokStringge(adat: Record<string, unknown>): Record<string, unknown> {
  const ki = { ...adat }
  for (const k of ['megjelent', 'frissitve', 'ellenorizve']) {
    const v = ki[k]
    if (v instanceof Date) ki[k] = v.toISOString().slice(0, 10)
  }
  return ki
}

/** Egy markdown fájl → Cikk. Dob, ha a fejléc hibás; a hibaüzenet MINDEN mezőhibát felsorol. */
export function olvasCikk(fajl: string, termekek: Termekek): Cikk {
  const { data, content } = matter(readFileSync(fajl, 'utf8'))
  const e = FejlecSema.safeParse(datumokStringge(data))
  const hibak: string[] = []
  if (!e.success) hibak.push(...e.error.issues.map((i) => `${i.path.join('.') || '(fejléc)'}: ${i.message}`))
  const fajlSlug = basename(fajl, '.md')
  if (typeof data.slug === 'string' && data.slug !== fajlSlug) hibak.push(`slug: (${data.slug}) nem egyezik a fájlnévvel (${fajlSlug})`)
  if (hibak.length) throw new Error(`${fajl}: hibás fejléc — ${hibak.join('; ')}`)
  const meta = e.data!
  if (!termekek[meta.termek]) throw new Error(`${fajl}: ismeretlen termék: ${meta.termek}`)
  return { ...meta, markdown: content.trim(), fajl }
}

/**
 * A cikk teljes szövege jelölők nélkül — az őrző-szabályok és a szószám alapja.
 * Nem HTML-ből, hanem a markdownból: a nyers HTML-t (pl. <script>…</script>) a
 * tartalmával együtt kidobjuk, hogy a szószámot ne tornázza fel.
 */
export function szovegCikk(c: Cikk): string {
  const torzs = c.markdown
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')                       // nyers HTML tag ki
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')       // kép → felirat
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')        // link → szöveg
    .replace(/^:::callout\s*(.*)$/gm, '$1')         // callout nyitó → címe
    .replace(/^:::\s*$/gm, '')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
  return [c.cim, c.bevezeto, c.leiras, torzs].join(' ').replace(/\s+/g, ' ').trim()
}

export function szoszam(c: Cikk): number {
  return szovegCikk(c).split(' ').filter((w) => w.length > 0).length
}

/** ~200 szó/perc magyar szövegre, legalább 1. Számított, nem tárolt — nem tud elavulni. */
export function olvasasiPerc(c: Cikk): number {
  return Math.max(1, Math.round(szoszam(c) / 200))
}
