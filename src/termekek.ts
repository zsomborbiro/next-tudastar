import { readFileSync } from 'node:fs'
import { z } from 'zod'
import type { Termekek } from './tipusok.ts'

const TermekSema = z.object({
  nev: z.string().min(1),
  domain: z.string().regex(/^https:\/\/[a-z.-]+$/, 'https:// és záró perjel nélkül'),
  orgId: z.string().url(),
  szabalyok: z.object({ nincsProbaido: z.boolean(), nincsKartyasFizetes: z.boolean() }),
})

/** A termék-katalógus betöltése és ellenőrzése. Hiba esetén dob — a build ne fusson tovább. */
export function betoltTermekek(fajl = 'termekek.json'): Termekek {
  const nyers = JSON.parse(readFileSync(fajl, 'utf8'))
  const eredmeny = z.record(z.string().regex(/^[a-z]+$/), TermekSema).safeParse(nyers)
  if (!eredmeny.success) {
    throw new Error(`termekek.json hibás: ${eredmeny.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }
  return eredmeny.data
}

export const TERMEKEK: Termekek = betoltTermekek()
