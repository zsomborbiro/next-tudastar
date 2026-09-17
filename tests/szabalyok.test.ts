import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ellenorizCikk, ellenorizTermek } from '../src/szabalyok.ts'
import { TERMEKEK } from '../src/termekek.ts'
import type { Cikk } from '../src/tipusok.ts'

const szoveg600 = Array.from({ length: 130 }, (_, i) => `ez a ${i}. mondat egy sima bekezdésben áll.`).join(' ')
function cikk(felul: Partial<Cikk> = {}): Cikk {
  return {
    termek: 'nextbill', slug: 'teszt', cim: 'Teszt cikk címe', bevezeto: 'Egy elég hosszú bevezető mondat, ami a leadet adja a laphoz.',
    leiras: 'Meta-leírás, ami száz és százhatvanöt karakter között van, hogy az őr ne bukjon rajta, és a kereső is mutassa.',
    tema: 'gyakorlat', megjelent: '2026-09-17', kapcsolodo: ['nextbill/a', 'nextbill/b'],
    markdown: `## Szakasz\n\n${szoveg600}`, fajl: 'x.md', ...felul,
  }
}
const hibak = (c: Cikk, termek = 'nextbill') => ellenorizCikk(c, TERMEKEK[termek], '2026-09-17')
const van = (lista: string[], minta: RegExp) => lista.some((h) => minta.test(h))

test('rendben lévő cikk: nincs hiba', () => assert.deepEqual(hibak(cikk()), []))
test('beégetett Ft-összeg', () => {
  assert.ok(van(hibak(cikk({ markdown: `## X\n\nA díj 12 990 Ft havonta. ${szoveg600}` })), /összeg/))
  assert.ok(!van(hibak(cikk({ markdown: `## X\n\nA díj a mindenkori árlapon. ${szoveg600}` })), /összeg/))
})
test('paragrafus csak jogszabályi cikkben tilos', () => {
  const md = `## X\n\nAz Áfa tv. 169. § szerint. ${szoveg600}`
  assert.ok(van(hibak(cikk({ tema: 'jogszabaly', markdown: md })), /paragrafus/))
  assert.ok(!van(hibak(cikk({ tema: 'gyakorlat', markdown: md })), /paragrafus/))
})
test('évszám jogszabályi cikkben csak elsődleges forrással és ellenőrzési dátummal', () => {
  const md = `## X\n\n2025. július 1-jétől kötelező. ${szoveg600}`
  assert.ok(van(hibak(cikk({ tema: 'jogszabaly', markdown: md })), /évszám/))
  const jo = cikk({ tema: 'jogszabaly', markdown: md, forrasok: [{ cim: 'NAV Online Számla', url: 'https://nav.gov.hu/x' }], ellenorizve: '2026-09-17' })
  assert.ok(!van(hibak(jo), /évszám/))
  const rosszForras = cikk({ tema: 'jogszabaly', markdown: md, forrasok: [{ cim: 'Egy blog', url: 'https://blog.hu/x' }], ellenorizve: '2026-09-17' })
  assert.ok(van(hibak(rosszForras), /elsődleges forrás/))
})
test('ellenőrzési dátum: nem korábbi a megjelenésnél, nem jövőbeli', () => {
  assert.ok(van(hibak(cikk({ ellenorizve: '2026-01-01' })), /korábbi/))
  assert.ok(van(hibak(cikk({ ellenorizve: '2027-01-01' })), /jövőbeli/))
})
test('megjelenés nem jövőbeli; frissítés nem korábbi a megjelenésnél', () => {
  assert.ok(van(hibak(cikk({ megjelent: '2027-01-01' })), /jövőbeli megjelenés/))
  assert.ok(van(hibak(cikk({ frissitve: '2026-01-01' })), /frissítés korábbi/))
})
test('kitalált statisztika', () => {
  assert.ok(van(hibak(cikk({ markdown: `## X\n\nA boltok 73%-a. ${szoveg600}` })), /százalék/))
  assert.ok(van(hibak(cikk({ markdown: `## X\n\nTöbb mint 500 ügyfél. ${szoveg600}` })), /darabszám/))
})
test('próbaidő-ígéret csak ott tilos, ahol a termék nem ad próbát', () => {
  const md = `## X\n\n14 napig ingyen kipróbálhatod. ${szoveg600}`
  assert.ok(van(hibak(cikk({ termek: 'nextraktar', markdown: md }), 'nextraktar'), /próba/))
  assert.ok(!van(hibak(cikk({ markdown: md })), /próba/))
  const tagado = `## X\n\nIngyenes próbaidőszak nincs, számla és átutalás van. ${szoveg600}`
  assert.ok(!van(hibak(cikk({ termek: 'nextraktar', markdown: tagado }), 'nextraktar'), /próba/))
})
test('kártyás fizetés ígérete csak ott tilos, ahol nincs — a vevő kártyája maradhat', () => {
  assert.ok(van(hibak(cikk({ termek: 'nextraktar', markdown: `## X\n\nA havidíj automatikusan levonásra kerül. ${szoveg600}` }), 'nextraktar'), /kártyás/))
  assert.ok(!van(hibak(cikk({ termek: 'nextraktar', markdown: `## X\n\nA vevő bankkártyával fizet a pultnál. ${szoveg600}` }), 'nextraktar'), /kártyás/))
  assert.ok(!van(hibak(cikk({ markdown: `## X\n\nA havidíj automatikusan levonásra kerül. ${szoveg600}` })), /kártyás/))
})
test('szószám, cím-márkanév, meta-hossz, kép-URL', () => {
  assert.ok(van(hibak(cikk({ markdown: '## X\n\nRövid.' })), /600 szó/))
  assert.ok(van(hibak(cikk({ cim: 'NextBill: hogyan számlázz' })), /márkanev/))
  assert.ok(van(hibak(cikk({ markdown: `## X\n\n![k](http://x.hu/a.png) ${szoveg600}` })), /kép/))
  assert.ok(van(hibak(cikk({ markdown: `## X\n\n![k](https://idegen.hu/a.png) ${szoveg600}` })), /családi domain/))
  assert.ok(!van(hibak(cikk({ markdown: `## X\n\n![k](https://nextraktar.hu/shots/a.webp) ${szoveg600}` })), /kép/))
})
test('termék-szint: egyedi cím, és ≥3 cikknél mindhárom téma', () => {
  const a = cikk({ slug: 'a' }), b = cikk({ slug: 'b' }), c = cikk({ slug: 'c', cim: 'Más cím ide' })
  assert.ok(van(ellenorizTermek([a, b, c], TERMEKEK.nextbill), /azonos a címe/))
  assert.ok(van(ellenorizTermek([a, cikk({ slug: 'b', cim: 'Második' }), c], TERMEKEK.nextbill), /hiányzó téma/))
  assert.deepEqual(ellenorizTermek([a, cikk({ slug: 'b', cim: 'Második', tema: 'penzugy' })], TERMEKEK.nextbill), [])
})
