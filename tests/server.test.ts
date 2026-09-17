import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from '../src/build.ts'
import { inditSzerver } from '../src/server.ts'

let dist: string, szerver: { close(): Promise<void>; port: number }, base: string
before(async () => {
  dist = mkdtempSync(join(tmpdir(), 'tudastar-srv-'))
  build({ cikkek: 'tests/fixtures/cikkek-tiszta', dist, most: 'X' })
  szerver = await inditSzerver({ dist, port: 0 })
  base = `http://127.0.0.1:${szerver.port}`
})
after(async () => { await szerver.close(); rmSync(dist, { recursive: true }) })

test('index.json: JSON, cache, CORS, ETag', async () => {
  const r = await fetch(`${base}/v1/nextbill/index.json`)
  assert.equal(r.status, 200)
  assert.match(r.headers.get('content-type')!, /application\/json/)
  assert.equal(r.headers.get('cache-control'), 'public, max-age=300')
  assert.equal(r.headers.get('access-control-allow-origin'), '*')
  assert.ok(r.headers.get('etag'))
  assert.equal((await r.json()).length, 2)
})
test('ETag: If-None-Match → 304', async () => {
  const etag = (await fetch(`${base}/v1/nextbill/index.json`)).headers.get('etag')!
  const r = await fetch(`${base}/v1/nextbill/index.json`, { headers: { 'If-None-Match': etag } })
  assert.equal(r.status, 304)
})
test('/v1/health és /robots.txt', async () => {
  assert.equal((await (await fetch(`${base}/v1/health`)).json()).ok, true)
  const rb = await fetch(`${base}/robots.txt`)
  assert.match(rb.headers.get('content-type')!, /text\/plain/)
  assert.match(await rb.text(), /Disallow: \//)
})
test('ismeretlen útvonal 404 JSON; kilépés a dist-ből 404', async () => {
  assert.equal((await fetch(`${base}/v1/nextbill/nincs.json`)).status, 404)
  assert.equal((await fetch(`${base}/v1/%2e%2e/%2e%2e/package.json`)).status, 404)
  assert.equal((await fetch(`${base}/v1/../../package.json`)).status, 404)
  assert.equal((await fetch(`${base}/v1/nextbill/`)).status, 404, 'könyvtár nem listázható')
})
test('csak GET és HEAD', async () => {
  assert.equal((await fetch(`${base}/v1/health`, { method: 'POST' })).status, 405)
  const h = await fetch(`${base}/v1/health`, { method: 'HEAD' })
  assert.equal(h.status, 200); assert.equal(await h.text(), '')
})

import { hookokatHiv } from '../src/server.ts'
import { writeFileSync, mkdirSync } from 'node:fs'

test('deploy-hook: friss build esetén minden URL-t meghív (POST), régi build esetén egyet sem', async () => {
  const d = mkdtempSync(join(tmpdir(), 'tudastar-hook-'))
  mkdirSync(join(d, 'v1'), { recursive: true })
  const hivasok: string[] = []
  const fetchFn = (async (url: any, init: any) => { hivasok.push(`${init?.method} ${url}`); return new Response('ok') }) as typeof fetch
  const most = Date.parse('2026-09-18T10:00:00Z')
  writeFileSync(join(d, 'v1/health.json'), JSON.stringify({ ok: true, build: '2026-09-18T09:55:00Z' }))
  const friss = await hookokatHiv({ dist: d, hookok: ['https://a/x', 'https://b/y'], most, fetchFn, markerMappa: d })
  assert.deepEqual(friss, ['https://a/x', 'https://b/y'])
  assert.deepEqual(hivasok, ['POST https://a/x', 'POST https://b/y'])
  // Ugyanaz az image (bélyeg) még egyszer — pl. újraindítás: nem hív újra.
  assert.deepEqual(await hookokatHiv({ dist: d, hookok: ['https://a/x'], most, fetchFn, markerMappa: d }), [])
  assert.equal(hivasok.length, 2)
  writeFileSync(join(d, 'v1/health.json'), JSON.stringify({ ok: true, build: '2026-09-18T08:00:00Z' }))
  assert.deepEqual(await hookokatHiv({ dist: d, hookok: ['https://a/x'], most, fetchFn, markerMappa: d }), [])
  assert.deepEqual(await hookokatHiv({ dist: d, hookok: [], most, fetchFn, markerMappa: d }), [])
  rmSync(d, { recursive: true })
})
