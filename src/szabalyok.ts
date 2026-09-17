import { szovegCikk, szoszam } from './cikk.ts'
import { kulcs } from './gyujtes.ts'
import type { Cikk, Termek } from './tipusok.ts'

// A NextRaktár `knowledge.test.ts` szabályai (2026-08-10 → 2026-09-12), termékenként
// kapcsolható részekkel. A tudástár tartalmi kockázata más, mint a marketingé:
// egy beégetett díjtétel vagy hatálydátum némán hamissá válik, és a cég neve
// alatt megy ki. Ezért nincs összeg, nincs paragrafus, nincs kitalált szám.

export const ELSODLEGES_FORRASOK = ['nav.gov.hu', 'magyarorszag.hu', 'njt.hu', 'europa.eu']
export const CSALADI_DOMAINEK = ['nextraktar.hu', 'nextbill.hu', 'nexthub.hu', 'nextceg.hu', 'nextweblap.hu', 'next-soft.hu']

/**
 * Az őr ÍGÉRETET tilt, nem szóelőfordulást: a „próbaidőszak nincs" a legőszintébb
 * mondat, amit adhatunk — a tagadó fordulatokat kivesszük a keresés ELŐTT.
 * Pozitív állítás („14 napig ingyen") ugyanúgy fennakad, abban nincs tagadás.
 */
const TAGADASOK = [
  /(ingyenes\s+)?próbaidőszak\s+nincs/g,
  /nincs\s+(ingyenes\s+)?próbaidőszak/g,
  /nincs\s+ingyenes\s+próba/g,
]
const PROBA_IGERETEK = ['14 nap', 'próbaidőszak', 'ingyenes próba', 'tizennégy nap']
// A BOLT VEVŐINEK kártyás fizetése sosem tiltott — ezért nincs csupasz „bankkártya" a listán.
const KARTYA_IGERETEK = ['stripe', 'megadod a bankkártyád', 'kártyaadatai', 'automatikusan levonásra kerül', 'automatikusan levonjuk', 'levonjuk a kártyádról']

function hoszton(url: string, domainek: string[]): boolean {
  try {
    const h = new URL(url).hostname
    return domainek.some((d) => h === d || h.endsWith(`.${d}`))
  } catch {
    return false
  }
}
const regexBiztos = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Egy cikk szabálysértései. `ma`: ISO dátum a „jövőbeli" ellenőrzéshez (tesztelhetőség). */
export function ellenorizCikk(c: Cikk, t: Termek, ma = new Date().toISOString().slice(0, 10)): string[] {
  const id = kulcs(c)
  const h: string[] = []
  const szoveg = szovegCikk(c)
  const kis = szoveg.toLowerCase()

  if (/\d[\d\s .]*(Ft|forint)\b/i.test(szoveg)) h.push(`${id}: beégetett összeg — összeg nem állhat cikkben (elavul)`)
  if (c.tema === 'jogszabaly' && /\d+\.?\s*§|§\s*\d|\bszakasz\s*\(\d/.test(szoveg)) h.push(`${id}: paragrafus-hivatkozás jogszabályi cikkben`)
  if (c.tema === 'jogszabaly' && /\b(19|20)\d{2}\b/.test(szoveg)) {
    const forrasok = c.forrasok ?? []
    if (!forrasok.length) h.push(`${id}: évszám van benne, de nincs forrása`)
    else if (!forrasok.some((f) => hoszton(f.url, ELSODLEGES_FORRASOK))) h.push(`${id}: évszám van benne, de nincs elsődleges forrása (${ELSODLEGES_FORRASOK.join(', ')})`)
    if (!c.ellenorizve) h.push(`${id}: évszám van benne, de nincs ellenőrzési dátuma`)
  }
  if (c.ellenorizve) {
    if (c.ellenorizve < c.megjelent) h.push(`${id}: az ellenőrzés korábbi a megjelenésnél`)
    if (c.ellenorizve > ma) h.push(`${id}: jövőbeli ellenőrzési dátum`)
  }
  if (c.megjelent > ma) h.push(`${id}: jövőbeli megjelenés`)
  if (c.frissitve && c.frissitve < c.megjelent) h.push(`${id}: a frissítés korábbi a megjelenésnél`)
  if (/\d+\s*%/.test(szoveg)) h.push(`${id}: százalékos adat — kitalált statisztika tilos`)
  if (/\b\d+\s*(bolt|ügyfél|felhasználó|cég|vásárló)\b/i.test(szoveg)) h.push(`${id}: darabszám — kitalált statisztika tilos`)
  if (t.szabalyok.nincsProbaido) {
    const igeret = TAGADASOK.reduce((acc, re) => acc.replace(re, ''), kis)
    for (const p of PROBA_IGERETEK) if (igeret.includes(p)) h.push(`${id}: próbaidő-ígéret („${p}"), pedig a termék nem ad próbát`)
  }
  if (t.szabalyok.nincsKartyasFizetes) {
    for (const k of KARTYA_IGERETEK) if (kis.includes(k)) h.push(`${id}: kártyás fizetés ígérete („${k}"), pedig a termék számlát és átutalást ad`)
  }
  if (szoszam(c) < 600) h.push(`${id}: legalább 600 szó kell (${szoszam(c)})`)
  const markanev = new RegExp(regexBiztos(t.nev), 'i')
  if (markanev.test(c.cim)) h.push(`${id}: a cím tartalmazza a márkanevet — azt a lap sablonja teszi hozzá`)
  if (c.metaCim && markanev.test(c.metaCim)) h.push(`${id}: a metaCim tartalmazza a márkanevet`)
  for (const m of c.markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const url = m[1]
    if (!url.startsWith('https://')) h.push(`${id}: kép-URL nem abszolút https: ${url}`)
    else if (!hoszton(url, CSALADI_DOMAINEK)) h.push(`${id}: kép nem családi domainen: ${url}`)
  }
  return h
}

/** Termék-szintű szabályok. */
export function ellenorizTermek(cikkek: Cikk[], t: Termek): string[] {
  const h: string[] = []
  const cimek = new Map<string, string>()
  for (const c of cikkek) {
    const k = (c.metaCim ?? c.cim).toLowerCase()
    if (cimek.has(k)) h.push(`${kulcs(c)}: azonos a címe a ${cimek.get(k)} cikkel`)
    cimek.set(k, kulcs(c))
  }
  if (cikkek.length >= 3) {
    const temak = new Set(cikkek.map((c) => c.tema))
    for (const tema of ['jogszabaly', 'gyakorlat', 'penzugy'] as const) if (!temak.has(tema)) h.push(`${t.nev}: hiányzó téma: ${tema}`)
  }
  return h
}
