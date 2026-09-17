import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, normalize, resolve, sep } from 'node:path'

// A tudástár kiszolgálója. Csak a build által előállított `dist/`-et adja ki;
// nincs állapot, nincs függőség (CSAK node: modulok — a runtime image-ben nincs
// node_modules). A `/v1/health` a `v1/health.json`-ra képződik.

const TIPUSOK: Record<string, string> = { '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' }

function utvonal(dist: string, url: string): string | null {
  let p: string
  try { p = decodeURIComponent(new URL(url, 'http://x').pathname) } catch { return null }
  if (p === '/v1/health') p = '/v1/health.json'
  const teljes = resolve(dist, `.${normalize(p)}`)
  const gyoker = resolve(dist)
  if (teljes !== gyoker && !teljes.startsWith(gyoker + sep)) return null // kilépés a dist-ből
  return teljes
}

export function kezel(dist: string) {
  return (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      return res.end()
    }
    const f = utvonal(dist, req.url ?? '/')
    const kit = f?.match(/\.[a-z]+$/)?.[0] ?? ''
    let adat: Buffer
    try {
      if (!f || !statSync(f).isFile()) throw new Error('nincs')
      adat = readFileSync(f)
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
      return res.end('{"hiba":"nincs ilyen"}')
    }
    const etag = `"${createHash('sha1').update(adat).digest('hex').slice(0, 16)}"`
    const cache = 'public, max-age=300'
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag, 'Cache-Control': cache })
      return res.end()
    }
    res.writeHead(200, {
      'Content-Type': TIPUSOK[kit] ?? 'application/octet-stream',
      'Cache-Control': cache,
      ETag: etag,
      'Access-Control-Allow-Origin': '*',
      'Content-Length': adat.length,
    })
    res.end(req.method === 'HEAD' ? undefined : adat)
  }
}

export function inditSzerver(opts: { dist: string; port: number }): Promise<{ close(): Promise<void>; port: number }> {
  return new Promise((ok) => {
    const s = createServer(kezel(opts.dist))
    s.listen(opts.port, '0.0.0.0', () => {
      const port = (s.address() as { port: number }).port
      ok({ port, close: () => new Promise((r) => s.close(() => r())) })
    })
  })
}

if (process.argv[1] && /server\.[jt]s$/.test(process.argv[1])) {
  const dist = process.env.DIST ?? join(process.cwd(), 'dist')
  const port = Number(process.env.PORT ?? 3000)
  inditSzerver({ dist, port }).then(({ port }) => console.log(`tudástár szolgáltatás: http://0.0.0.0:${port} (dist: ${dist})`))
}
