import { test } from 'node:test'
import assert from 'node:assert/strict'
import { olvasCikk, szovegCikk, szoszam, olvasasiPerc } from '../src/cikk.ts'
import { TERMEKEK } from '../src/termekek.ts'

test('a minta cikk beolvasható, a fejléc és a törzs szétválik', () => {
  const c = olvasCikk('tests/fixtures/cikkek/nextbill/minta.md', TERMEKEK)
  assert.equal(c.termek, 'nextbill')
  assert.equal(c.slug, 'minta')
  assert.equal(c.tema, 'gyakorlat')
  assert.deepEqual(c.kapcsolodo, ['nextbill/masik', 'nextraktar/harmadik'])
  assert.match(c.markdown, /^## Első szakasz/)
  assert.equal(c.fajl, 'tests/fixtures/cikkek/nextbill/minta.md')
})

test('a szöveg jelölők nélkül áll össze, és a szószám ebből jön', () => {
  const c = olvasCikk('tests/fixtures/cikkek/nextbill/minta.md', TERMEKEK)
  const t = szovegCikk(c)
  assert.ok(t.startsWith('Minta cikk a tesztekhez'))
  assert.ok(!t.includes('**'), 'félkövér jelölő maradt')
  assert.ok(!t.includes(':::'), 'callout jelölő maradt')
  assert.ok(!t.includes('https://nextraktar.hu/shots'), 'kép-URL a szövegben')
  assert.ok(t.includes('Képfelirat'), 'a képfelirat része a szövegnek')
  assert.ok(!t.includes('alert(1)'), 'nyers HTML tartalma a szövegben')
  assert.ok(szoszam(c) >= 600)
  assert.equal(olvasasiPerc(c), Math.max(1, Math.round(szoszam(c) / 200)))
})

test('hibás fejléc: minden hibát egyszerre, olvashatóan', () => {
  assert.throws(
    () => olvasCikk('tests/fixtures/cikkek/nextbill/rossz-fejlec.md', TERMEKEK),
    (e: Error) => /bevezeto/.test(e.message) && /tema/.test(e.message) && /megjelent/.test(e.message) && /slug/.test(e.message),
  )
})

test('ismeretlen termék nem megy át', () => {
  assert.throws(() => olvasCikk('tests/fixtures/cikkek/nextbill/minta.md', { nextraktar: TERMEKEK.nextraktar }), /ismeretlen termék/)
})
