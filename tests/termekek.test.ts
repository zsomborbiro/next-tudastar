import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TERMEKEK, betoltTermekek } from '../src/termekek.ts'

test('mind a hat termék benne van, domainnel és @id-vel', () => {
  assert.deepEqual(Object.keys(TERMEKEK).sort(), ['nextbill', 'nextceg', 'nexthub', 'nextraktar', 'nextsoft', 'nextweblap'])
  for (const [kulcs, t] of Object.entries(TERMEKEK)) {
    assert.match(t.domain, /^https:\/\/[a-z.-]+$/, `${kulcs}: domain`)
    assert.equal(t.orgId, `${t.domain}/#organization`, `${kulcs}: az orgId a család egységes alakja`)
  }
})

test('csak a nextraktár tiltja a próbaidőt és a kártyás fizetést', () => {
  assert.equal(TERMEKEK.nextraktar.szabalyok.nincsProbaido, true)
  assert.equal(TERMEKEK.nextbill.szabalyok.nincsProbaido, false)
})

test('hibás fájl nem tölthető be némán', () => {
  assert.throws(() => betoltTermekek('tests/fixtures/rossz-termekek.json'), /orgId/)
})
