import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from '../src/build.ts'

// A rossz-fejlec fixture-t a build nem tűri — egy külön, tiszta fixture-fát használunk.
const FORRAS = 'tests/fixtures/cikkek-tiszta'

test('a build minden végpont fájlját legenerálja, abszolút URL-ekkel', () => {
  const dist = mkdtempSync(join(tmpdir(), 'tudastar-'))
  build({ cikkek: FORRAS, dist, most: '2026-09-17T10:00:00.000Z' })
  const index = JSON.parse(readFileSync(join(dist, 'v1/nextbill/index.json'), 'utf8'))
  assert.equal(index.length, 2)
  assert.equal(index[0].url, 'https://nextbill.hu/tudastar/masik')
  assert.ok(index[0].percek >= 3)
  const cikk = JSON.parse(readFileSync(join(dist, 'v1/nextbill/minta.json'), 'utf8'))
  assert.match(cikk.html, /<h2 id="elso-szakasz">/)
  assert.equal(cikk.orgId, 'https://nextbill.hu/#organization')
  assert.equal(cikk.metaCim, 'Minta cikk a tesztekhez')
  assert.deepEqual(cikk.kapcsolodo.map((k: any) => k.url), ['https://nextbill.hu/tudastar/masik', 'https://nextraktar.hu/tudastar/harmadik'])
  assert.equal(cikk.kapcsolodo[1].nev, 'nextraktár')
  const sitemap = JSON.parse(readFileSync(join(dist, 'v1/nextraktar/sitemap.json'), 'utf8'))
  assert.deepEqual(sitemap, [{ url: 'https://nextraktar.hu/tudastar/harmadik', lastmod: '2026-09-17' }])
  const health = JSON.parse(readFileSync(join(dist, 'v1/health.json'), 'utf8'))
  assert.equal(health.cikkek, 3)
  assert.equal(health.build, '2026-09-17T10:00:00.000Z')
  // Cikk nélküli terméknek is van üres indexe — az oldal buildje ne bukjon 404-en.
  assert.deepEqual(JSON.parse(readFileSync(join(dist, 'v1/nexthub/index.json'), 'utf8')), [])
  assert.ok(existsSync(join(dist, 'robots.txt')))
  rmSync(dist, { recursive: true })
})

test('determinisztikus: kétszer ugyanaz a kimenet', () => {
  const a = mkdtempSync(join(tmpdir(), 'tudastar-a-')), b = mkdtempSync(join(tmpdir(), 'tudastar-b-'))
  build({ cikkek: FORRAS, dist: a, most: 'X' }); build({ cikkek: FORRAS, dist: b, most: 'X' })
  assert.equal(readFileSync(join(a, 'v1/nextbill/minta.json'), 'utf8'), readFileSync(join(b, 'v1/nextbill/minta.json'), 'utf8'))
  rmSync(a, { recursive: true }); rmSync(b, { recursive: true })
})

test('szabálysértő cikk esetén a build dob, és nem ír ki semmit', () => {
  const dist = mkdtempSync(join(tmpdir(), 'tudastar-'))
  assert.throws(() => build({ cikkek: 'tests/fixtures/cikkek-rossz', dist }), /beégetett összeg/)
  assert.ok(!existsSync(join(dist, 'v1')))
  rmSync(dist, { recursive: true })
})
