# Tudástár 2. terv: a NextRaktár `/tudastar` átáll a szolgáltatásra (pillanatkép a buildben)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A nextraktar.hu tudástára a `tudastar.next-soft.hu` szolgáltatásból épül (a 4100 soros `knowledge.ts` tartalma kikerül a repóból), a 22 cikk URL-je változatlan, minden meglévő őr-teszt és a belső linkháló érintetlen; új cikk után a NextRaktár magától újraépül.

**Architecture:** A NextRaktár Docker-buildje első lépésként letölti a `/v1/nextraktar/index.json`-t és a cikkeket egy generált `src/lib/tudastar.generated.json`-ba; a `lib/knowledge.ts` ebből adja a RÉGI felületet (`ARTICLES`, `findArticle`, `articleText`, `readingMinutes`, `TOPIC_LABELS`), így a 9 fogyasztó nem változik. A `[slug]` lap a kész HTML-t injektálja. A tudástár-szolgáltatás induláskor meghívja a NextRaktár deploy-hookját.

**Tech Stack:** NextRaktár `site/`: Next 15, TS, pnpm 9 workspace, vitest. next-tudastar: Node 20 TS. NextHub deploy hook: `POST https://api.nexthub.hu/webhooks/deploy/<token>`.

**Spec:** `docs/superpowers/specs/2026-09-17-tudastar-design.md` (4.2 NextRaktár-kivétel, 4.4)

## Global Constraints

- NextRaktár repó: `/home/kincsemgodlinux/gitrepos/nextraktar-web` — a fő checkout feature-ágon áll, piszkos → **worktree** `.worktrees/tudastar-atallas` az `origin/main`-ről, `pnpm install --frozen-lockfile` a worktree gyökerében. A site: `site/` (`@raktar/site`), tesztek: `cd site && npx vitest run`, típus: `npx tsc --noEmit`.
- A NextRaktár tesztek/kommentek magyarul, commit angolul, `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Az `Article` régi mezőnevei MARADNAK (`slug, topic, title, metaTitle, metaDescription, lead, published, updated?, forrasok?, ellenorizve?`) — a 9 fogyasztó ezeket olvassa. Új mezők: `html`, `tartalomjegyzek`, `percek`. A `body: Block[]` és a `Block` típus MEGSZŰNIK.
- `readingMinutes` marad számított (`articleText` szavai / 200), NEM a szolgáltatás `percek` mezője — a „számított, nem tárolt" teszt ezt őrzi.
- Szolgáltatás URL: `TUDASTAR_URL` env (alapérték `https://tudastar.next-soft.hu`), termék `nextraktar`.
- A generált fájl: `site/src/lib/tudastar.generated.json` — gitignore-olva; a build és a teszt ELŐTT `pnpm --filter @raktar/site tudastar:sync`. Ha hiányzik, a `knowledge.ts` érthető hibával dob („futtasd: pnpm tudastar:sync").
- Deploy hook: a `next-tudastar` `server.ts` `DEPLOY_HOOKS` env (vesszővel elválasztott URL-ek), indulás után 60 s-cel, egyszer, és CSAK ha a `dist/v1/health.json` `build` időbélyege 15 percnél frissebb (sima újraindítás ne buildeltessen).
- A NextRaktár-service-ek: prod `nextraktar-hu-web` (`cmpsltwjh4d7rpi0158vc3ana`), stage `nextraktar-stage-web` (`cmsqdt5px887ytb01dtf6azlm`); a tudástár-service `cmu63hxh4001rph01fwvwese8`.

---

### Task 1: Deploy-hook hívás a tudástár-szolgáltatás indulásakor

**Files:**
- Modify: `next-tudastar/src/server.ts`
- Test: `next-tudastar/tests/server.test.ts`

**Interfaces:**
- Produces: `hookokatHiv(opts: { dist: string; hookok: string[]; most?: number; fetchFn?: typeof fetch }): Promise<string[]>` — a meghívott URL-ek listája (üres, ha nem friss a build vagy nincs hook).

- [ ] **Step 1: Bukó teszt** — a `tests/server.test.ts` végére:

```ts
import { hookokatHiv } from '../src/server.ts'
import { writeFileSync, mkdirSync } from 'node:fs'

test('deploy-hook: friss build esetén minden URL-t meghív (POST), régi build esetén egyet sem', async () => {
  const d = mkdtempSync(join(tmpdir(), 'tudastar-hook-'))
  mkdirSync(join(d, 'v1'), { recursive: true })
  const hivasok: string[] = []
  const fetchFn = (async (url: any, init: any) => { hivasok.push(`${init?.method} ${url}`); return new Response('ok') }) as typeof fetch
  const most = Date.parse('2026-09-18T10:00:00Z')
  writeFileSync(join(d, 'v1/health.json'), JSON.stringify({ ok: true, build: '2026-09-18T09:55:00Z' }))
  const friss = await hookokatHiv({ dist: d, hookok: ['https://a/x', 'https://b/y'], most, fetchFn })
  assert.deepEqual(friss, ['https://a/x', 'https://b/y'])
  assert.deepEqual(hivasok, ['POST https://a/x', 'POST https://b/y'])
  writeFileSync(join(d, 'v1/health.json'), JSON.stringify({ ok: true, build: '2026-09-18T08:00:00Z' }))
  assert.deepEqual(await hookokatHiv({ dist: d, hookok: ['https://a/x'], most, fetchFn }), [])
  assert.deepEqual(await hookokatHiv({ dist: d, hookok: [], most, fetchFn }), [])
  rmSync(d, { recursive: true })
})
```

- [ ] **Step 2: Futtasd, bukjon** — `cd ~/gitrepos/next-tudastar && npm test` → `hookokatHiv is not exported`

- [ ] **Step 3: Implementáció** — `src/server.ts` végére, a CLI-blokk ELÉ:

```ts
/**
 * Deploy-hookok: a NextRaktár a tudástárat a SAJÁT buildjében pillanatképezi
 * (spec 4.2 kivétel), ezért új tartalom után újra kell építeni. Ezt innen
 * indítjuk: friss image indulásakor POST a `DEPLOY_HOOKS` URL-ekre.
 * CSAK friss buildnél (15 perc) — egy sima újraindítás vagy crash-loop ne
 * buildeltessen. Hiba nem dönti el a szolgáltatást: naplózunk és megyünk tovább.
 */
export async function hookokatHiv(opts: { dist: string; hookok: string[]; most?: number; fetchFn?: typeof fetch }): Promise<string[]> {
  if (opts.hookok.length === 0) return []
  let build: number
  try { build = Date.parse(JSON.parse(readFileSync(join(opts.dist, 'v1/health.json'), 'utf8')).build) } catch { return [] }
  const most = opts.most ?? Date.now()
  if (!(most - build < 15 * 60_000)) return []
  const f = opts.fetchFn ?? fetch
  const hivott: string[] = []
  for (const url of opts.hookok) {
    try {
      const r = await f(url, { method: 'POST' })
      console.log(`deploy-hook ${url.replace(/\/[^/]+$/, '/…')}: ${r.status}`)
      hivott.push(url)
    } catch (e) {
      console.log(`deploy-hook ${url.replace(/\/[^/]+$/, '/…')}: HIBA ${(e as Error).message}`)
    }
  }
  return hivott
}
```

A CLI-blokkban az indítás után:
```ts
  inditSzerver({ dist, port }).then(({ port }) => {
    console.log(`tudástár szolgáltatás: http://0.0.0.0:${port} (dist: ${dist})`)
    const hookok = (process.env.DEPLOY_HOOKS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    if (hookok.length) setTimeout(() => hookokatHiv({ dist, hookok }), 60_000).unref()
  })
```

- [ ] **Step 4: Futtasd, menjen át** — `npm test`; `npx tsc --noEmit`; `npm run build` (a `tsconfig.server.json` fordítja — a `readFileSync`/`join` már importálva).

- [ ] **Step 5: Commit + push** (autodeploy → új tudástár-image; a `DEPLOY_HOOKS` env még nincs, tehát nem hív semmit)

```bash
git add -A && git commit -m "feat(server): call NextHub deploy hooks once after a fresh build starts (DEPLOY_HOOKS)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>" && git push
```

---

### Task 2: NextRaktár worktree + a pillanatkép-szinkron script

**Files:**
- Create: `site/scripts/tudastar-sync.ts`, `site/src/lib/tudastar-snapshot.ts`
- Modify: `site/package.json` (scripts), `site/.gitignore` (vagy a repó gyökér `.gitignore`)
- Test: `site/src/lib/tudastar-snapshot.test.ts`

**Interfaces:**
- Produces: `tudastar-snapshot.ts` — `SnapshotCikk` (a szolgáltatás `CikkJson` alakja), `Snapshot { letoltve: string; forras: string; cikkek: SnapshotCikk[] }`, `snapshotBolArticle(c: SnapshotCikk): Article`-t NEM itt (a knowledge.ts-ben, Task 3) — itt csak a letöltés: `letoltSnapshot(base: string, fetchFn?): Promise<Snapshot>`.

- [ ] **Step 1: Worktree + install**

```bash
cd /home/kincsemgodlinux/gitrepos/nextraktar-web && git fetch -q origin
git worktree add -q .worktrees/tudastar-atallas -b feature/tudastar-szolgaltatas origin/main
cd .worktrees/tudastar-atallas && pnpm install --frozen-lockfile --prefer-offline 2>&1 | tail -1
cd site && npx vitest run 2>&1 | grep -E "Test Files|Tests "   # alapvonal: mind zöld
```

- [ ] **Step 2: Bukó teszt** — `site/src/lib/tudastar-snapshot.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { letoltSnapshot } from './tudastar-snapshot'

const INDEX = [{ slug: 'a', cim: 'A cikk', leiras: 'x', tema: 'gyakorlat', megjelent: '2026-09-01', percek: 3, url: 'https://nextraktar.hu/tudastar/a' }]
const CIKK = { ...INDEX[0], metaCim: 'A cikk', bevezeto: 'lead', html: '<p>szöveg</p>', tartalomjegyzek: [], kapcsolodo: [], orgId: 'https://nextraktar.hu/#organization' }

function fetchFn(valaszok: Record<string, unknown>): typeof fetch {
  return (async (url: any) => {
    const v = valaszok[String(url)]
    return v === undefined ? new Response('nincs', { status: 404 }) : new Response(JSON.stringify(v), { headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
}

describe('tudástár-pillanatkép letöltése', () => {
  it('az indexből minden cikket letölt, és a forrást+időt rögzíti', async () => {
    const s = await letoltSnapshot('https://t.example', fetchFn({ 'https://t.example/v1/nextraktar/index.json': INDEX, 'https://t.example/v1/nextraktar/a.json': CIKK }))
    expect(s.cikkek).toHaveLength(1)
    expect(s.cikkek[0].html).toBe('<p>szöveg</p>')
    expect(s.forras).toBe('https://t.example/v1/nextraktar')
    expect(s.letoltve).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
  it('üres index = hiba: a tudástár nem lehet üres, az elveszett tartalom rosszabb a bukó buildnél', async () => {
    await expect(letoltSnapshot('https://t.example', fetchFn({ 'https://t.example/v1/nextraktar/index.json': [] }))).rejects.toThrow(/üres/)
  })
  it('hiányzó cikk = hiba a slug nevével', async () => {
    await expect(letoltSnapshot('https://t.example', fetchFn({ 'https://t.example/v1/nextraktar/index.json': INDEX }))).rejects.toThrow(/a\.json.*404/)
  })
})
```

- [ ] **Step 3: Futtasd, bukjon** — `npx vitest run src/lib/tudastar-snapshot.test.ts`

- [ ] **Step 4: `site/src/lib/tudastar-snapshot.ts`**

```ts
// A tudástár PILLANATKÉPE. A cikkek a next-tudastar repóban élnek (markdown),
// a tudastar.next-soft.hu szolgáltatás adja kész HTML+JSON-ként. Ez a lap NEM
// futásidőben kérdezi (spec 4.2 kivétel): a buildben töltjük le egy generált
// JSON-ba, mert a sitemap, a belső linkháló (related.ts) és öt teszt-család
// szinkron olvassa az `ARTICLES`-t — és a jogi őrök (penztargep.test.ts) csak
// így futnak továbbra is a saját buildünkben.

export interface SnapshotCikk {
  slug: string; cim: string; metaCim: string; leiras: string; bevezeto: string
  tema: 'jogszabaly' | 'gyakorlat' | 'penzugy'
  megjelent: string; frissitve?: string; percek: number; url: string
  html: string; tartalomjegyzek: { id: string; cim: string }[]
  forrasok?: { cim: string; url: string }[]; ellenorizve?: string
  kapcsolodo: { termek: string; nev: string; slug: string; cim: string; url: string }[]
  orgId: string
}
export interface Snapshot { letoltve: string; forras: string; cikkek: SnapshotCikk[] }

export const TUDASTAR_URL_ALAP = 'https://tudastar.next-soft.hu'
export const TERMEK = 'nextraktar'

async function json<T>(f: typeof fetch, url: string): Promise<T> {
  const r = await f(url, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error(`${url}: ${r.status}`)
  return (await r.json()) as T
}

export async function letoltSnapshot(base: string, f: typeof fetch = fetch): Promise<Snapshot> {
  const forras = `${base.replace(/\/+$/, '')}/v1/${TERMEK}`
  const index = await json<{ slug: string }[]>(f, `${forras}/index.json`)
  if (index.length === 0) throw new Error(`${forras}/index.json: üres tudástár — nem buildelünk cikkek nélkül`)
  const cikkek: SnapshotCikk[] = []
  for (const { slug } of index) cikkek.push(await json<SnapshotCikk>(f, `${forras}/${slug}.json`))
  return { letoltve: new Date().toISOString(), forras, cikkek }
}
```

- [ ] **Step 5: A script + package.json + gitignore**

`site/scripts/tudastar-sync.ts`:
```ts
// Pillanatkép a tudástárról → src/lib/tudastar.generated.json (gitignore-olt).
// Futtatás: pnpm --filter @raktar/site tudastar:sync   (a build és a teszt ELŐTT)
import { writeFileSync } from 'node:fs'
import { letoltSnapshot, TUDASTAR_URL_ALAP } from '../src/lib/tudastar-snapshot'

const base = process.env.TUDASTAR_URL || TUDASTAR_URL_ALAP
const s = await letoltSnapshot(base)
writeFileSync(new URL('../src/lib/tudastar.generated.json', import.meta.url), JSON.stringify(s))
console.log(`tudástár-pillanatkép: ${s.cikkek.length} cikk ← ${s.forras}`)
```

`site/package.json` scripts-be:
```json
    "tudastar:sync": "npx tsx scripts/tudastar-sync.ts",
    "test:tudastar": "vitest run src/lib/knowledge.test.ts src/lib/penztargep.test.ts src/lib/meta-hossz.test.ts src/lib/related.test.ts src/lib/kereses-lefedes.test.ts src/app/sitemap-coverage.test.ts",
```
(`tsx` van-e a site devDependencies-ben? `grep tsx site/package.json` — ha nincs: `pnpm --filter @raktar/site add -D tsx`.)

A repó gyökér `.gitignore`-jába: `site/src/lib/tudastar.generated.json`.

- [ ] **Step 6: Futtasd** — `npx vitest run src/lib/tudastar-snapshot.test.ts` zöld; `pnpm tudastar:sync` → `tudástár-pillanatkép: 22 cikk ← https://tudastar.next-soft.hu/v1/nextraktar`; `git status` NEM mutatja a generált fájlt.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(tudastar): snapshot downloader for the knowledge-base service

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `lib/knowledge.ts` — vékony betöltő a pillanatképből (a régi felülettel)

**Files:**
- Modify: `site/src/lib/knowledge.ts` (4100 sor → ~70), `site/src/lib/knowledge.test.ts` (csak a GYIK-őrök maradnak)
- Test: `site/src/lib/knowledge.test.ts`

**Interfaces:**
- Produces (változatlan nevek): `ArticleTopic`, `Article` (mezők: Global Constraints), `TOPIC_LABELS`, `ARTICLES`, `findArticle(slug)`, `articleText(a)`, `articleWordCount(a)`, `readingMinutes(a)`. MEGSZŰNIK: `Block`.

- [ ] **Step 1: Az új `knowledge.ts`** (a régit teljesen lecseréli)

```ts
// Tudástár — VÉKONY BETÖLTŐ. 2026-09-18 óta a cikkek NEM itt élnek: a
// next-tudastar repóban (markdown), a tudastar.next-soft.hu szolgáltatás adja
// kész HTML-ként, és a build pillanatképezi (l. tudastar-snapshot.ts,
// scripts/tudastar-sync.ts). Ez a modul a RÉGI felületet adja a 9 fogyasztónak
// (sitemap, related.ts, tudastar/ lapok, öt teszt-család), hogy azoknak ne
// kelljen tudniuk a forrásváltásról.
//
// Az általános tartalmi őrök (összeg, paragrafus, évszám, statisztika, próba,
// kártya, szószám, meta-hossz) a tartalom-repóba költöztek és OTT bukják a
// buildet. Itt az maradt, amit csak ez a repó tud: a GYIK-őrök (knowledge.test.ts)
// és a pénztárgép-cikk jogi őre (penztargep.test.ts).
import type { Snapshot, SnapshotCikk } from './tudastar-snapshot'

export type ArticleTopic = 'jogszabaly' | 'gyakorlat' | 'penzugy'

export interface Article {
  slug: string
  topic: ArticleTopic
  title: string
  metaTitle: string
  metaDescription: string
  lead: string
  published: string
  updated?: string
  forrasok?: { cim: string; url: string }[]
  ellenorizve?: string
  /** A szolgáltatás által renderelt, sanitizált HTML — a lap injektálja. */
  html: string
  tartalomjegyzek: { id: string; cim: string }[]
}

export const TOPIC_LABELS: Record<ArticleTopic, string> = {
  jogszabaly: 'Szabályozás',
  gyakorlat: 'Gyakorlat',
  penzugy: 'Pénzügy',
}

function betolt(): Snapshot {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./tudastar.generated.json') as Snapshot
  } catch {
    throw new Error('Hiányzik a tudástár-pillanatkép (src/lib/tudastar.generated.json). Futtasd: pnpm --filter @raktar/site tudastar:sync')
  }
}

export function snapshotBolArticle(c: SnapshotCikk): Article {
  return {
    slug: c.slug, topic: c.tema, title: c.cim, metaTitle: c.metaCim, metaDescription: c.leiras, lead: c.bevezeto,
    published: c.megjelent, ...(c.frissitve ? { updated: c.frissitve } : {}),
    ...(c.forrasok ? { forrasok: c.forrasok } : {}), ...(c.ellenorizve ? { ellenorizve: c.ellenorizve } : {}),
    html: c.html, tartalomjegyzek: c.tartalomjegyzek,
  }
}

export const ARTICLES: Article[] = betolt().cikkek.map(snapshotBolArticle)

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

/** A cikk teljes szövege — az őrző tesztek és a szószám ezt nézik. A HTML-ből, tagek nélkül. */
export function articleText(a: Article): string {
  const torzs = a.html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  return [a.title, a.lead, a.metaTitle, a.metaDescription, torzs].join(' ').replace(/\s+/g, ' ').trim()
}

export function articleWordCount(a: Article): number {
  return articleText(a).split(' ').filter((w) => w.length > 0).length
}

/** ~200 szó/perc, legalább 1. SZÁNDÉKOSAN számított, nem a szolgáltatás `percek` mezője. */
export function readingMinutes(a: Article): number {
  return Math.max(1, Math.round(articleWordCount(a) / 200))
}
```

⚠ Ha a `require` a Next/ESM alatt nem megy (a site `"type"` nélküli CJS-kompatibilis? — ellenőrizd `site/package.json`), akkor statikus import: `import snapshot from './tudastar.generated.json'` — ekkor a hiányzó fájl fordítási hiba, ami szintén jó (a hibaüzenet a build-logban a fájlnév lesz). A `tsconfig` `resolveJsonModule: true` kell hozzá.

- [ ] **Step 2: `knowledge.test.ts` szűkítése** — MARAD: a `describe('tudástár és GYIK — nincs kártyás-fizetés ígéret')` FAQ-ra vonatkozó három tesztje, a `'a GYIK sem ígér próbaidőszakot'`, a `describe('tudástár — nem versenyez a saját oldalainkkal')` (GYIK-mondat), és az „épség" blokkból: `'egyedi slug, egyedi cím, és mindhárom téma képviselve van'`, `'az olvasási idő számított — nincs tárolt mező'`, `'a cím nem tartalmazza a márkanevet'`. KIKERÜL (a tartalom-repóban él): Ft-összeg, paragrafus, évszám (+ellenpróba), ellenőrzési dátum, forrás-lista, statisztika, cikk-próbaidő, cikk-kártya, „a bolt VEVŐINEK", 600 szó, meta-leírás sáv, dátum ISO. A fájl fejlécébe egy bekezdés: hova költöztek és miért (`next-tudastar/src/szabalyok.ts`). A `SHOTS` import kikerül, ha már nem használja senki a fájlban.

- [ ] **Step 3: Teljes teszt + típus**

```bash
cd site && pnpm tudastar:sync && npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL"
npx tsc --noEmit 2>&1 | head
```
Várható bukás: `article-body.tsx` (`Block` import) és `tudastar/[slug]/page.tsx` (`a.body`) — ezeket a Task 4 rendezi; minden más zöld. Ha a `related.ts`/`sitemap.ts`/tesztek buknak, az a mezőnév-leképezés hibája — itt javítsd, ne ott.

- [ ] **Step 4: Commit** (Task 4 után, együtt — a köztes állapot nem fordul)

---

### Task 4: A cikk-lap a kész HTML-t injektálja

**Files:**
- Create: `site/src/components/article-html.tsx`
- Delete: `site/src/components/article-body.tsx`
- Modify: `site/src/app/tudastar/[slug]/page.tsx`
- Test: `site/src/components/article-html.test.tsx`

- [ ] **Step 1: Bukó teszt**

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArticleHtml } from './article-html'

describe('ArticleHtml', () => {
  it('a szolgáltatás HTML-jét változatlanul, egy stílusozott burokban adja', () => {
    const html = renderToStaticMarkup(<ArticleHtml html={'<h2 id="a">A</h2><p>b</p><div class="tudastar-callout"><p class="tudastar-callout-cim">C</p><p>d</p></div>'} />)
    expect(html).toContain('class="tudastar-html"')
    expect(html).toContain('<h2 id="a">A</h2>')
    expect(html).toContain('tudastar-callout-cim')
  })
})
```

- [ ] **Step 2: `article-html.tsx`**

```tsx
import { marketing } from '@/lib/theme'

// A tudástár-cikk törzse: a tudastar.next-soft.hu által renderelt, sanitizált
// HTML (csak p/h2/h3/ul/ol/li/strong/em/a/img/figure/blockquote/code/div.callout).
// A forrás a SAJÁT szolgáltatásunk, a build sanitizálta — ezért injektálható.
// A stílus itt, a `.tudastar-html` alatt él: a szolgáltatás class-nevei
// (`tudastar-callout`, `tudastar-callout-cim`, `tudastar-kep`) rögzítettek.
const { green: G, greenText: G_TEXT, ink: INK, inkMuted: INK_MUTED, inkFaint: INK_FAINT, border: BORDER, card: CARD } = marketing

export function ArticleHtml({ html }: { html: string }) {
  return (
    <>
      <style>{`
        .tudastar-html { font-size: 17px; line-height: 1.75; color: ${INK_MUTED}; }
        .tudastar-html h2 { font-size: clamp(21px, 2.8vw, 27px); font-weight: 800; color: ${INK}; letter-spacing: -0.025em; line-height: 1.25; margin: 44px 0 14px; scroll-margin-top: 90px; }
        .tudastar-html h3 { font-size: 19px; font-weight: 700; color: ${INK}; margin: 28px 0 10px; }
        .tudastar-html p { margin: 0 0 18px; }
        .tudastar-html ul, .tudastar-html ol { margin: 0 0 18px; padding-left: 24px; }
        .tudastar-html li { margin: 0 0 8px; }
        .tudastar-html strong { color: ${INK}; }
        .tudastar-html a { color: ${G_TEXT}; font-weight: 600; }
        .tudastar-html .tudastar-callout { background: ${CARD}; border: 1px solid ${BORDER}; border-left: 4px solid ${G}; border-radius: 12px; padding: 16px 20px; margin: 24px 0; }
        .tudastar-html .tudastar-callout-cim { font-weight: 700; color: ${INK}; margin: 0 0 6px; }
        .tudastar-html .tudastar-callout p:last-child { margin: 0; }
        .tudastar-html .tudastar-kep { margin: 28px 0; }
        .tudastar-html .tudastar-kep img { display: block; width: 100%; height: auto; border: 1px solid ${BORDER}; border-radius: 12px; }
        .tudastar-html .tudastar-kep figcaption { font-size: 14px; color: ${INK_FAINT}; margin-top: 8px; text-align: center; }
      `}</style>
      <div className="tudastar-html" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
```

(A `marketing` token-neveit ellenőrizd a `lib/theme.ts`-ben — a régi `article-body.tsx` ugyanezeket használta.)

- [ ] **Step 3: `[slug]/page.tsx` módosítás** —
  - import: `ArticleBody` → `ArticleHtml`; `+ import { ORG_ID } from '@/lib/ceg'`
  - `<ArticleBody body={a.body} />` → `<ArticleHtml html={a.html} />`
  - JSON-LD: `author: { '@type': 'Organization', name: 'nextraktár' }, publisher: { '@type': 'Organization', name: 'nextraktár' }` → `author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }` (+ komment: az 1. SEO-csomag gráfjához köt, l. lib/ceg.ts).
  - Minden más (hero, források, RelatedLinks, CTA) változatlan.
  - `git rm site/src/components/article-body.tsx` — ellenőrizd, hogy más nem importálja: `git grep -n "article-body"`.

- [ ] **Step 4: Teljes teszt + típus + build**

```bash
cd site && npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL"; npx tsc --noEmit 2>&1 | head -3
npm run build 2>&1 | grep -E "error|✓ Compiled|✓ Generating|tudastar/" | head
```
Várható: mind zöld; a build 22 `/tudastar/<slug>` lapot generál (`●` SSG).

- [ ] **Step 5: Előtte/utána URL-összevetés**

```bash
curl -s https://nextraktar.hu/sitemap.xml | grep -o '<loc>[^<]*/tudastar/[^<]*</loc>' | sed 's/<[^>]*>//g' | sort > /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/elotte.txt
cd site && node -e "
const s=require('./.next/server/app/sitemap.xml.body'); " 2>/dev/null || true
grep -o 'https://nextraktar.hu/tudastar/[a-z0-9-]*' .next/server/app/sitemap.xml.body | sort -u > /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/utana.txt
diff /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/elotte.txt /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/utana.txt && echo "URL-EK EGYEZNEK (22)"
```
(Ha a `.next/server/app/sitemap.xml.body` nincs, a sitemap dinamikus — `npm start` + `curl localhost:3003/sitemap.xml`.)

- [ ] **Step 6: Commit** (Task 3 + 4 együtt)

```bash
git add -A && git commit -m "feat(tudastar): articles come from the tudastar.next-soft.hu snapshot; knowledge.ts is a thin loader

- lib/knowledge.ts keeps its interface (ARTICLES, findArticle, articleText,
  readingMinutes, TOPIC_LABELS) but reads src/lib/tudastar.generated.json
  written by scripts/tudastar-sync.ts at build time — sitemap, related.ts and
  the guard tests are untouched
- the [slug] page injects the service-rendered HTML (ArticleHtml) instead of
  the Block renderer; BlogPosting author/publisher link the Organization @id
- knowledge.test.ts keeps only the FAQ guards; the generic content rules now
  live in next-tudastar/src/szabalyok.ts and fail that build
- 4100 lines of article content leave this repo; the 22 URLs are unchanged

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Dockerfile — szinkron + tudástár-tesztek a build előtt

**Files:**
- Modify: `site/Dockerfile`

- [ ] **Step 1: A `COPY site ./site` UTÁN, a `RUN pnpm --filter @raktar/site build` ELŐTT:**

```dockerfile
# ── Tudástár-pillanatkép (2026-09-18) ──────────────────────────────────────
# A cikkek a tudastar.next-soft.hu szolgáltatásból jönnek (next-tudastar repó).
# A buildben töltjük le (l. lib/tudastar-snapshot.ts), és ITT futnak a
# tartalomra vonatkozó saját őrök is (GYIK, pénztárgép-cikk, meta, linkháló,
# sitemap-lefedés) — eddig csak a CI-ban futottak, ami 2026-08 óta blokkolt.
# Elérhetetlen szolgáltatás vagy bukó őr = nincs image: inkább a régi marad
# élesben, mint egy üres vagy szabálysértő tudástár.
ARG TUDASTAR_URL="https://tudastar.next-soft.hu"
ENV TUDASTAR_URL=$TUDASTAR_URL
RUN pnpm --filter @raktar/site tudastar:sync && pnpm --filter @raktar/site test:tudastar
```

- [ ] **Step 2: Helyi konténer-build (a repó gyökere a kontextus)**

```bash
cd /home/kincsemgodlinux/gitrepos/nextraktar-web/.worktrees/tudastar-atallas
docker build -f site/Dockerfile -t nextraktar-local . 2>&1 | grep -E "tudástár-pillanatkép|Tests |Test Files|ERROR|error TS|✓ Compiled" | head
docker run -d --rm --name nextraktar-local nextraktar-local >/dev/null; sleep 4
IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nextraktar-local)
curl -s http://$IP:3003/tudastar/betetdij-a-kasszaban | grep -o '<h2 id="[^"]*"' | head -3
curl -s http://$IP:3003/tudastar/betetdij-a-kasszaban | grep -o '"publisher":{"@id":"[^"]*"}'
curl -s -o /dev/null -w "%{http_code}\n" http://$IP:3003/tudastar/nincs-ilyen
docker rm -f nextraktar-local >/dev/null
```
Várható: `22 cikk`, tesztek zöld, h2-k a HTML-ben, `publisher` `@id` = `https://nextraktar.hu/#organization`, ismeretlen slug 404. (A `docker run -p` a hoszton nem érhető el localhostról — bridge-IP.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "build(site): snapshot the knowledge base and run its guards inside the Docker build

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Push → deploy (prod + stage) → élő ellenőrzés

- [ ] **Step 1: Fast-forward ellenőrzés + push a `main`-re**

```bash
git fetch -q origin && git merge-base --is-ancestor origin/main HEAD && git push -q origin feature/tudastar-szolgaltatas:main && echo pushed
```
Ha az `origin/main` közben elmozdult: `git rebase origin/main`, tesztek újra, majd push.

- [ ] **Step 2: Buildek** — `deploysapp_list_builds` a `cmpsltwjh4d7rpi0158vc3ana` (prod) és `cmsqdt5px887ytb01dtf6azlm` (stage) service-en → `success`. A build-logban: `tudástár-pillanatkép: 22 cikk`.

- [ ] **Step 3: Élő ellenőrzés a nyers HTML-ből (JS nélkül)**

```bash
for u in https://nextraktar.hu/tudastar https://nextraktar.hu/tudastar/betetdij-a-kasszaban https://nextraktar.hu/tudastar/e-nyugta-nyugtaadat-szolgaltatas; do
  printf "%s → %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' "$u")"; done
curl -s https://nextraktar.hu/tudastar/e-nyugta-nyugtaadat-szolgaltatas | grep -c 'tudastar-html'
curl -s https://nextraktar.hu/tudastar/e-nyugta-nyugtaadat-szolgaltatas | grep -o '<link rel="canonical" href="[^"]*"'
curl -s https://nextraktar.hu/tudastar/e-nyugta-nyugtaadat-szolgaltatas | grep -o '"@type":"BlogPosting"[^}]*' | head -c 300
curl -s https://nextraktar.hu/tudastar/e-nyugta-nyugtaadat-szolgaltatas | grep -o 'Ellenőrizve: [0-9. ]*'
curl -s -o /dev/null -w "%{http_code}\n" https://nextraktar.hu/tudastar/nincs-ilyen-cikk
curl -s https://nextraktar.hu/sitemap.xml | grep -c '/tudastar/'
```
Várható: 200/200/200; `tudastar-html` ≥1; canonical a saját URL; BlogPosting; „Ellenőrizve"; 404; 22 (a lista-lap + 22 = 23, ha a `/tudastar` is a sitemapban van).

---

### Task 7: Deploy-hook bekötése (content-push → NextRaktár rebuild)

- [ ] **Step 1: Hook-tokenek a két NextRaktár-service-en** (a NextHub API ugyanígy generálja: 32 random bájt hexben)

```bash
cd /home/kincsemgodlinux/deploysapp
for id in cmpsltwjh4d7rpi0158vc3ana cmsqdt5px887ytb01dtf6azlm; do
  T=$(openssl rand -hex 32)
  docker compose exec -T postgres psql -U "$(grep ^POSTGRES_USER .env | cut -d= -f2)" -d "$(grep ^POSTGRES_DB .env | cut -d= -f2)" -Atc "update \"Service\" set \"deployHookToken\"=coalesce(\"deployHookToken\",'$T') where id='$id' returning name, \"deployHookToken\";"
done
```
(`coalesce`: ha már volt token, azt hagyja.) Az URL: `https://api.nexthub.hu/webhooks/deploy/<token>`.

- [ ] **Step 2: `DEPLOY_HOOKS` env a tudástár-service-en** — MCP `deploysapp_set_env` (service `cmu63hxh4001rph01fwvwese8`, `DEPLOY_HOOKS` = a két URL vesszővel), majd `deploysapp_redeploy_service` (friss image → indulás után 60 s-cel hív).

- [ ] **Step 3: Ellenőrzés** — 2 perc múlva `deploysapp_list_builds` a prod és stage NextRaktáron: új build `queued/building`, a tudástár-service logjában (`docker logs dsapp_cmmey1i8_tudastar 2>&1 | grep deploy-hook`) `deploy-hook …/…: 200`. Várd meg a NextRaktár buildet: `success`.

- [ ] **Step 4: Ellenpróba** — `deploysapp_restart_service` a tudástár-service-en (NEM redeploy): a health `build` régi → a log NEM mutat új hook-hívást, a NextRaktáron nincs új build.

---

### Task 8: Lezárás — memória + worktree takarítás

- [ ] Memória: `project_tudastar_service_live.md` frissítése (NextRaktár átállt; hook-tokenek helye: DB `Service.deployHookToken`; a `tudastar:sync` a lokális fejlesztéshez is kell; a cikkekben megszűnt a képernyőkép-nagyító).
- [ ] `git worktree remove .worktrees/tudastar-atallas && git branch -d feature/tudastar-szolgaltatas` (a nextraktar-web-ben).
- [ ] Jelentés: URL-egyezés, tesztszám, élő ellenőrzés, hook-próba eredménye.

## Önellenőrzés

- Spec 4.2 kivétel → T2+T3+T5; 4.3 (JSON-LD `@id`, HTML injektálás) → T4; 4.4 (knowledge.test szűkítés, GYIK-őr marad) → T3; deploy-hook → T1+T7; „előtte/utána URL-összevetés" → T4/6; „élő ellenőrzés nyers HTML-ből" → T6.
- Nevek: `letoltSnapshot`/`Snapshot`/`SnapshotCikk` (T2) ↔ `knowledge.ts` (T3); `ArticleHtml` (T4) ↔ `[slug]/page.tsx`; `hookokatHiv` (T1) ↔ CLI + teszt; `ORG_ID` a `lib/ceg.ts`-ből (az 1. SEO-csomag).
- Kockázat, amit a terv tudatosan vállal: a NextRaktár build hálózatfüggő lett (a szolgáltatásra) — a bukó build a régi image-et hagyja élesben, ez a kívánt viselkedés.
