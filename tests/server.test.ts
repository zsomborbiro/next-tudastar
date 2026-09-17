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
