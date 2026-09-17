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

/**
 * Deploy-hookok: a NextRaktár a tudástárat a SAJÁT buildjében pillanatképezi
 * (spec 4.2 kivétel), ezért új tartalom után újra kell építeni. Ezt innen
 * indítjuk: friss image indulásakor POST a `DEPLOY_HOOKS` URL-ekre.
 * CSAK friss buildnél (15 perc) — egy sima újraindítás vagy crash-loop ne
 * buildeltessen. Hiba nem dönti el a szolgáltatást: naplózunk és megyünk tovább.
 *
 * ⚠ A `health.build` bélyeg a `dist` GENERÁLÁSÁNAK ideje, nem a deployé: a
 * NextHub build-cache-e tartalom-változás nélkül (pl. kézi redeploy) a régi
 * réteget adja vissza, a bélyeg marad → nem hív. Ez szándékos: ha a tartalom
 * nem változott, a NextRaktárt sem kell újraépíteni. (2026-09-18-án így derült ki.)
 */
export async function hookokatHiv(opts: { dist: string; hookok: string[]; most?: number; fetchFn?: typeof fetch }): Promise<string[]> {
  if (opts.hookok.length === 0) return []
  let build: number
  try {
    build = Date.parse(JSON.parse(readFileSync(join(opts.dist, 'v1/health.json'), 'utf8')).build)
  } catch {
    return []
  }
  const most = opts.most ?? Date.now()
  if (!(most - build < 15 * 60_000)) return []
  const f = opts.fetchFn ?? fetch
  const hivott: string[] = []
  for (const url of opts.hookok) {
    const nev = url.replace(/\/[^/]+$/, '/…')
    try {
      const r = await f(url, { method: 'POST' })
      console.log(`deploy-hook ${nev}: ${r.status}`)
      hivott.push(url)
    } catch (e) {
      console.log(`deploy-hook ${nev}: HIBA ${(e as Error).message}`)
    }
  }
  return hivott
}

if (process.argv[1] && /server\.[jt]s$/.test(process.argv[1])) {
  const dist = process.env.DIST ?? join(process.cwd(), 'dist')
  const port = Number(process.env.PORT ?? 3000)
  inditSzerver({ dist, port }).then(({ port }) => {
    console.log(`tudástár szolgáltatás: http://0.0.0.0:${port} (dist: ${dist})`)
    const hookok = (process.env.DEPLOY_HOOKS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    if (hookok.length) setTimeout(() => hookokatHiv({ dist, hookok }), 60_000).unref()
  })
}
