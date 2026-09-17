# Tudástár 3a. terv: a `/tudastar` réteg az öt másik oldalon (élő ISR)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NextBill, NextHub, NextSoft, NextWeblap és NextCég kap egy `/tudastar` (lista) + `/tudastar/[slug]` (cikk) útvonalat, amely a `tudastar.next-soft.hu` szolgáltatásból ISR-rel (óránként) épül — új cikk redeploy nélkül jelenik meg; a sitemap, a `BlogPosting`+`BreadcrumbList` séma és a lábléc-link mindenhol egységes.

**Architecture:** Oldalanként egy vékony réteg: `lib/tudastar.ts` (3 fetch-segéd `revalidate: 3600`-zal + a JSON-szerződés típusai), két lap a saját fejléc/lábléc között, a sitemap kiegészítése a szolgáltatás `sitemap.json`-jával, lábléc-link. A cikk-HTML injektálva, a stílus Tailwind arbitrary-variant osztályokkal (`[&_h2]:…`) — nincs CSS-fájl, nincs CSP-kérdés. `generateStaticParams` a listából: elérhetetlen szolgáltatás = bukó build (spec 4.2); `dynamicParams = true`: új slug ISR-rel, ismeretlen → `notFound()`. Üres tudástár (még nincs cikk a termékhez, 3b előtt): a lista `noindex`, a sitemap nem tartalmaz tudástár-tételt.

**Tech Stack:** NextBill TS/Next 15 (vitest); NextHub JS/Next 15 (vitest); NextSoft TS/Next 14 (`node:test` + tsx); NextWeblap TS/Next 14 (vitest); NextCég TS/Next 16 (`node:test` + tsx). Tailwind mindenhol.

**Spec:** `docs/superpowers/specs/2026-09-17-tudastar-design.md` (4.1–4.4). Élő JSON-szerződés: `next-tudastar/src/kimenet.ts`.

## Global Constraints

- **Worktree minden repóban** az `origin/main`-ről (`.worktrees/tudastar-reteg`, ág `feature/tudastar-reteg`) — a fő checkoutok más ágon, piszkosan állhatnak. `npm ci` (nextweblap/szamlazo/cegkereso/nextsoft) ill. `web/`-ben `npm ci` (deploysapp — a symlink helyett; a `.git/info/exclude`-ban a `web/node_modules` már ki van zárva). Repó-elérési utak: `~/gitrepos/szamlazo`, `~/deploysapp` (master!), `~/gitrepos/nextsoft`, `~/gitrepos/nextweblap`, `~/gitrepos/cegkereso`.
- Commit angolul + `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`; kód-komment/tesztnév magyarul.
- **Szolgáltatás:** `TUDASTAR_URL` env, alapérték `https://tudastar.next-soft.hu`. Termék-kulcs oldalanként: `nextbill`, `nexthub`, `nextsoft`, `nextweblap`, `nextceg`.
- **`lib/tudastar` közös felület (minden oldalon ugyanez a 3 név):** `tudastarLista(): Promise<IndexTetel[]>`; `tudastarCikk(slug): Promise<CikkJson | null>` (404 → `null`, más hiba → dob); `tudastarSitemap(): Promise<SitemapTetel[]>` (hiba → `[]` + `console.error`, hogy a sitemap ne döntse el a lapot). Mind `fetch(url, { next: { revalidate: 3600 } })`.
- **Lapok:** `export const revalidate = 3600`; `[slug]`: `dynamicParams = true`, `generateStaticParams` a listából (dob, ha a szolgáltatás nem elérhető). Lista üresen: `robots: { index: false }` + „Hamarosan" szöveg.
- **JSON-LD** a cikk-lapon: `BlogPosting` (`headline`=cim, `description`=leiras, `datePublished`, `dateModified`=frissitve??megjelent, `inLanguage: hu-HU`, `mainEntityOfPage`=url, `citation` ha van forrás, `author`/`publisher` = `{ "@id": ORG_ID }`) + `BreadcrumbList` (Főoldal → Tudástár → cikk). `ORG_ID` = az oldal saját `Organization` `@id`-je (1. SEO-csomag): NextBill `${SITE_URL}/#organization` (lib/seo), NextHub `ORG_ID` (web/src/lib/jsonld.js), NextSoft `NEXTSOFT_ORG_ID` (src/lib/jsonld.ts), NextWeblap `platformOrgId('https://nextweblap.hu')` (src/lib/platform-jsonld.ts), NextCég `ORG_ID` (lib/jsonld.ts). A `<script>` tartalma `.replace(/</g, '\\u003c')`-tel.
- **HTML-burok osztálylista (`TUDASTAR_HTML`):** `[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:scroll-mt-24 [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_a]:font-semibold [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_.tudastar-callout]:my-6 [&_.tudastar-callout]:rounded-xl [&_.tudastar-callout]:border [&_.tudastar-callout]:p-5 [&_.tudastar-callout-cim]:font-bold [&_.tudastar-callout-cim]:mb-1 [&_.tudastar-kep]:my-7 [&_.tudastar-kep_img]:w-full [&_.tudastar-kep_img]:rounded-xl [&_.tudastar-kep_img]:border [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm` + oldalanként a szín-osztályok (címsor: az oldal `ink`-je, törzs: `ink-muted`, link: az oldal akcentje, keret: `line`/`border`).
- **Lábléc-link:** „Tudástár" → `/tudastar` mind az öt láblécben; a NextBill fejlécében is (`MarketingHeader` items).
- **Tesztek oldalanként:** (1) `lib/tudastar` a `fetch` mockolásával: lista; cikk 404 → null; cikk 500 → dob; sitemap hiba → []; (2) a sitemap tartalmazza a szolgáltatás URL-jeit (mock) és üres tudástárnál nem tartalmaz `/tudastar`-t; (3) forrás-szintű: a cikk-lap `publisher` `@id`-je az oldal `ORG_ID`-jét használja (nem beégetett string).
- **Ellenőrzés oldalanként (nyers HTML, JS nélkül):** `curl` a `/tudastar`-ra (200; üres tudástárnál `noindex` meta), a sitemapra (nincs tudástár-URL, amíg nincs cikk), és a NextRaktár-gráfhoz hasonlóan a `/tudastar/nincs-ilyen` → 404.
- **NextCég `/blog`:** a `(public)/blog/**` és az `api/admin/blog/**` törlődik; `next.config.ts` `redirects()`: `/blog` → `/tudastar` (308) és `/blog/:slug` → `/tudastar` (308; nem volt poszt, nincs mit leképezni); a sitemap `blogPost` lekérése kikerül; a `Footer` „Tudástár" linkje `/tudastar`-ra vált. A Prisma `BlogPost` modell **marad** (nincs migráció-folyamat a repóban, a séma-törlés külön kör).

---

### Task 1: NextBill — referencia-implementáció

**Files:**
- Create: `src/lib/tudastar-tipusok.ts`, `src/lib/tudastar.ts`, `src/lib/tudastar.test.ts`, `src/app/tudastar/page.tsx`, `src/app/tudastar/[slug]/page.tsx`, `src/components/tudastar/TudastarHtml.tsx`, `src/components/tudastar/TudastarJsonLd.tsx`
- Modify: `src/lib/seo.ts` (ORG_ID export), `src/components/JsonLd.tsx` (ORG_ID használata), `src/app/sitemap.ts` (async + tudástár), `src/app/sitemap.test.ts`, `src/components/MarketingHeader.tsx` (nav item), `src/components/MarketingFooter.tsx` (link)

**Interfaces:**
- Produces: `tudastarLista`, `tudastarCikk`, `tudastarSitemap` (Global Constraints), `TudastarHtml({ html })`, `TudastarJsonLd({ cikk, siteUrl, orgId, listaNev })`.

- [ ] **Step 1: Worktree + install + alapvonal**

```bash
cd ~/gitrepos/szamlazo && git fetch -q origin && git worktree add -q .worktrees/tudastar-reteg -b feature/tudastar-reteg origin/main
cd .worktrees/tudastar-reteg && npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -1 && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

- [ ] **Step 2: Típusok — `src/lib/tudastar-tipusok.ts`** (a szolgáltatás szerződése, másolat a `next-tudastar/src/kimenet.ts`-ből)

```ts
// A tudastar.next-soft.hu JSON-szerződése (next-tudastar repó, src/kimenet.ts).
// Csak bővülhet; a mezőnevek a szolgáltatás oldalán rögzítettek.
export type Tema = 'jogszabaly' | 'gyakorlat' | 'penzugy'
export const TEMA_CIMKE: Record<Tema, string> = { jogszabaly: 'Szabályozás', gyakorlat: 'Gyakorlat', penzugy: 'Pénzügy' }

export interface IndexTetel {
  slug: string; cim: string; leiras: string; tema: Tema; megjelent: string; frissitve?: string; percek: number; url: string
}
export interface KapcsolodoTetel { termek: string; nev: string; slug: string; cim: string; url: string }
export interface CikkJson extends IndexTetel {
  metaCim: string; bevezeto: string; html: string
  tartalomjegyzek: { id: string; cim: string }[]
  forrasok?: { cim: string; url: string }[]; ellenorizve?: string
  kapcsolodo: KapcsolodoTetel[]; orgId: string
}
export interface SitemapTetel { url: string; lastmod: string }
```

- [ ] **Step 3: Bukó teszt — `src/lib/tudastar.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tudastarCikk, tudastarLista, tudastarSitemap } from './tudastar'

const valasz = (adat: unknown, status = 200) =>
  new Response(status === 200 ? JSON.stringify(adat) : 'hiba', { status, headers: { 'content-type': 'application/json' } })

afterEach(() => vi.unstubAllGlobals())

describe('tudástár-kliens', () => {
  it('a lista a termék indexét kéri, óránkénti újraérvényesítéssel', async () => {
    const f = vi.fn(async () => valasz([{ slug: 'a', cim: 'A' }]))
    vi.stubGlobal('fetch', f)
    expect(await tudastarLista()).toEqual([{ slug: 'a', cim: 'A' }])
    expect(f).toHaveBeenCalledWith('https://tudastar.next-soft.hu/v1/nextbill/index.json', expect.objectContaining({ next: { revalidate: 3600 } }))
  })
  it('ismeretlen cikk null (ebből lesz a 404), szerverhiba dob', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => valasz(null, 404)))
    expect(await tudastarCikk('nincs')).toBeNull()
    vi.stubGlobal('fetch', vi.fn(async () => valasz(null, 500)))
    await expect(tudastarCikk('x')).rejects.toThrow(/500/)
  })
  it('a sitemap hibára üres listát ad — a sitemap ne döntse el a lapot', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('hálózat') }))
    const hiba = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await tudastarSitemap()).toEqual([])
    expect(hiba).toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Futtasd, bukjon** — `npx vitest run src/lib/tudastar.test.ts`

- [ ] **Step 5: `src/lib/tudastar.ts`**

```ts
import type { CikkJson, IndexTetel, SitemapTetel } from './tudastar-tipusok'

// A tudástár-kliens. A cikkek a next-tudastar repóban élnek (markdown), a
// tudastar.next-soft.hu szolgáltatás adja kész HTML+JSON-ként; ez a lap ISR-rel
// (óránként) olvassa — új cikk redeploy nélkül jelenik meg. Ha a szolgáltatás a
// BUILD alatt nem elérhető, a generateStaticParams dob, és a build bukik
// (szándékos: ne deployoljunk üres tudástárral). Futásidőben az ISR az utolsó
// jó változatot szolgálja ki.
const BASE = (process.env.TUDASTAR_URL || 'https://tudastar.next-soft.hu').replace(/\/+$/, '')
export const TUDASTAR_TERMEK = 'nextbill'
const ISR = { next: { revalidate: 3600 } } as const

async function json<T>(utvonal: string): Promise<T | null> {
  const r = await fetch(`${BASE}/v1/${TUDASTAR_TERMEK}/${utvonal}`, { ...ISR, headers: { accept: 'application/json' } })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`tudástár ${utvonal}: ${r.status}`)
  return (await r.json()) as T
}

export async function tudastarLista(): Promise<IndexTetel[]> {
  return (await json<IndexTetel[]>('index.json')) ?? []
}

export async function tudastarCikk(slug: string): Promise<CikkJson | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  return json<CikkJson>(`${slug}.json`)
}

export async function tudastarSitemap(): Promise<SitemapTetel[]> {
  try {
    return (await json<SitemapTetel[]>('sitemap.json')) ?? []
  } catch (e) {
    console.error('tudástár sitemap nem elérhető:', (e as Error).message)
    return []
  }
}
```

- [ ] **Step 6: Futtasd, menjen át** — `npx vitest run src/lib/tudastar.test.ts`

- [ ] **Step 7: `ORG_ID` a `lib/seo.ts`-be, és a `JsonLd.tsx` használja**

`src/lib/seo.ts`-be a `NEXTSOFT_ORG_ID` mellé:
```ts
/** Ez a lap mint szervezet — a gyökér JSON-LD írja le, a tudástár BlogPosting-ja hivatkozza. */
export const ORG_ID = `${SITE_URL}/#organization`
```
`src/components/JsonLd.tsx`: `'@id': \`${SITE_URL}/#organization\`` → `'@id': ORG_ID` (import bővítése); a `Ld` komponens kapjon `export`-ot (a tudástár is használja).

- [ ] **Step 8: Komponensek**

`src/components/tudastar/TudastarHtml.tsx`:
```tsx
// A cikk törzse: a tudastar.next-soft.hu által renderelt, sanitizált HTML
// (p/h2/h3/ul/ol/li/strong/em/a/img/figure/blockquote/code/div.callout). A
// forrás a saját szolgáltatásunk — ezért injektálható. A class-nevek
// (tudastar-callout, tudastar-callout-cim, tudastar-kep) ott rögzítettek.
const TUDASTAR_HTML =
  'text-[17px] leading-[1.75] text-ink-muted ' +
  '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-ink [&_h2]:scroll-mt-24 ' +
  '[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink ' +
  '[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_strong]:text-ink ' +
  '[&_a]:font-semibold [&_a]:text-sapph-hi [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 ' +
  '[&_.tudastar-callout]:my-6 [&_.tudastar-callout]:rounded-xl [&_.tudastar-callout]:border [&_.tudastar-callout]:border-line [&_.tudastar-callout]:border-l-4 [&_.tudastar-callout]:border-l-sapph [&_.tudastar-callout]:bg-surface-card [&_.tudastar-callout]:p-5 ' +
  '[&_.tudastar-callout-cim]:font-bold [&_.tudastar-callout-cim]:text-ink [&_.tudastar-callout-cim]:mb-1 [&_.tudastar-callout_p:last-child]:mb-0 ' +
  '[&_.tudastar-kep]:my-7 [&_.tudastar-kep_img]:w-full [&_.tudastar-kep_img]:rounded-xl [&_.tudastar-kep_img]:border [&_.tudastar-kep_img]:border-line ' +
  '[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-ink-dim'

export default function TudastarHtml({ html }: { html: string }) {
  return <div className={TUDASTAR_HTML} dangerouslySetInnerHTML={{ __html: html }} />
}
```

`src/components/tudastar/TudastarJsonLd.tsx`:
```tsx
import { Ld } from '@/components/JsonLd'
import type { CikkJson } from '@/lib/tudastar-tipusok'

/**
 * BlogPosting + BreadcrumbList a tudástár-cikkhez. A `publisher`/`author` a lap
 * saját Organization csomópontjára mutat (@id) — az 1. SEO-csomag entitás-
 * gráfjához köt. FAQPage szándékosan nincs: a NextRaktáron két FAQPage egymás
 * ellen versenyzett a találati listában.
 */
export default function TudastarJsonLd({ cikk, siteUrl, orgId }: { cikk: CikkJson; siteUrl: string; orgId: string }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: cikk.cim,
            description: cikk.leiras,
            datePublished: cikk.megjelent,
            dateModified: cikk.frissitve ?? cikk.megjelent,
            inLanguage: 'hu-HU',
            mainEntityOfPage: cikk.url,
            ...(cikk.forrasok?.length ? { citation: cikk.forrasok.map((f) => f.url) } : {}),
            author: { '@id': orgId },
            publisher: { '@id': orgId },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Főoldal', item: `${siteUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'Tudástár', item: `${siteUrl}/tudastar` },
              { '@type': 'ListItem', position: 3, name: cikk.cim, item: cikk.url },
            ],
          },
        ],
      }}
    />
  )
}
```

- [ ] **Step 9: Lista-lap — `src/app/tudastar/page.tsx`**

```tsx
import Link from 'next/link'
import MarketingFooter from '@/components/MarketingFooter'
import MarketingHeader from '@/components/MarketingHeader'
import Section from '@/components/marketing/Section'
import { pageMetadata } from '@/lib/seo'
import { tudastarLista } from '@/lib/tudastar'
import { TEMA_CIMKE } from '@/lib/tudastar-tipusok'

export const revalidate = 3600

const LEIRAS = 'Számlázás, NAV Online Számla és a vállalkozás mindennapjai — érthetően, forrásokkal. A NextBill tudástára.'

export async function generateMetadata() {
  const lista = await tudastarLista()
  return {
    ...pageMetadata({ path: '/tudastar', title: 'Tudástár', description: LEIRAS }),
    // Amíg nincs cikk, a lap ne kerüljön indexbe — egy üres lista rossz jel.
    ...(lista.length === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

const datum = (iso: string) => iso.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1. $2. $3.')

export default async function TudastarPage() {
  const lista = await tudastarLista()
  return (
    <div className="min-h-screen bg-surface text-ink">
      <MarketingHeader active="tudastar" />
      <main>
        <Section band="alt" eyebrow="Tudástár" title="Számlázás és NAV — érthetően" lead={LEIRAS}>
          {lista.length === 0 ? (
            <p className="mx-auto max-w-[640px] text-center text-ink-muted">Az első cikkek hamarosan érkeznek.</p>
          ) : (
            <ul className="mx-auto grid max-w-[960px] gap-5 md:grid-cols-2">
              {lista.map((c) => (
                <li key={c.slug} className="rounded-2xl border border-line bg-surface-card p-6">
                  <p className="m-0 mb-2 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-sapph">{TEMA_CIMKE[c.tema]}</p>
                  <h2 className="m-0 mb-2 text-[19px] font-bold leading-snug text-ink">
                    <Link href={`/tudastar/${c.slug}`} className="no-underline hover:text-sapph-hi">{c.cim}</Link>
                  </h2>
                  <p className="m-0 mb-3 text-[15px] leading-relaxed text-ink-muted">{c.leiras}</p>
                  <p className="m-0 font-mono text-[12px] text-ink-dim">{datum(c.megjelent)} · {c.percek} perc olvasás</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
      <MarketingFooter />
    </div>
  )
}
```

- [ ] **Step 10: Cikk-lap — `src/app/tudastar/[slug]/page.tsx`**

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarketingFooter from '@/components/MarketingFooter'
import MarketingHeader from '@/components/MarketingHeader'
import TudastarHtml from '@/components/tudastar/TudastarHtml'
import TudastarJsonLd from '@/components/tudastar/TudastarJsonLd'
import { ORG_ID, SITE_URL, pageMetadata } from '@/lib/seo'
import { tudastarCikk, tudastarLista } from '@/lib/tudastar'
import { TEMA_CIMKE } from '@/lib/tudastar-tipusok'

export const revalidate = 3600
// Új cikk a szolgáltatásban → ISR-rel, redeploy nélkül; ismeretlen slug → 404.
export const dynamicParams = true

export async function generateStaticParams() {
  // Ha a szolgáltatás nem elérhető, ez dob, és a build bukik — szándékosan.
  return (await tudastarLista()).map((c) => ({ slug: c.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const c = await tudastarCikk(slug)
  if (!c) return { title: 'Nem található' }
  return pageMetadata({ path: `/tudastar/${c.slug}`, title: c.metaCim, description: c.leiras })
}

const datum = (iso: string) => iso.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1. $2. $3.')

export default async function TudastarCikkPage({ params }: Props) {
  const { slug } = await params
  const c = await tudastarCikk(slug)
  if (!c) notFound()
  return (
    <div className="min-h-screen bg-surface text-ink">
      <TudastarJsonLd cikk={c} siteUrl={SITE_URL} orgId={ORG_ID} />
      <MarketingHeader active="tudastar" />
      <main>
        <section className="site-section bg-surface-alt border-b border-line">
          <div className="mx-auto max-w-[760px] px-6 py-12">
            <p className="m-0 mb-4 text-sm"><Link href="/tudastar" className="font-semibold text-sapph-hi no-underline">← Tudástár</Link></p>
            <p className="m-0 mb-3 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-sapph">
              {TEMA_CIMKE[c.tema]} <span className="ml-3 normal-case tracking-normal text-ink-dim">{datum(c.megjelent)} · {c.percek} perc olvasás{c.ellenorizve && <> · Ellenőrizve: {datum(c.ellenorizve)}</>}</span>
            </p>
            <h1 className="m-0 mb-4 text-[clamp(28px,4.4vw,44px)] font-extrabold leading-[1.12] tracking-[-0.03em] text-ink">{c.cim}</h1>
            <p className="m-0 text-[18px] leading-[1.7] text-ink-muted">{c.bevezeto}</p>
          </div>
        </section>
        <section className="site-section">
          <article className="mx-auto max-w-[760px] px-6 py-10">
            {c.tartalomjegyzek.length >= 3 && (
              <nav aria-label="Tartalom" className="mb-8 rounded-xl border border-line bg-surface-card p-5 text-sm">
                <p className="m-0 mb-2 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-dim">Ebben a cikkben</p>
                <ol className="m-0 list-decimal pl-5">{c.tartalomjegyzek.map((t) => <li key={t.id} className="mb-1"><a href={`#${t.id}`} className="text-ink-muted hover:text-sapph-hi">{t.cim}</a></li>)}</ol>
              </nav>
            )}
            <TudastarHtml html={c.html} />
            {c.forrasok && c.forrasok.length > 0 && (
              <aside aria-labelledby="forrasok" className="mt-11 border-t border-line pt-6">
                <h2 id="forrasok" className="m-0 mb-3 text-[17px] font-bold text-ink">Források</h2>
                <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-ink-muted">
                  {c.forrasok.map((f) => <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sapph-hi">{f.cim}</a></li>)}
                </ul>
                {c.ellenorizve && <p className="m-0 mt-3 text-sm text-ink-dim">Az állításokat {datum(c.ellenorizve)} napon ellenőriztük a fenti forrásokban. A szabályok változhatnak — a saját helyzetedről a könyvelőd tud felelősséggel nyilatkozni.</p>}
              </aside>
            )}
            {c.kapcsolodo.length > 0 && (
              <aside aria-labelledby="kapcsolodo" className="mt-11 border-t border-line pt-6">
                <h2 id="kapcsolodo" className="m-0 mb-3 text-[17px] font-bold text-ink">Ezt is érdemes elolvasni</h2>
                <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                  {c.kapcsolodo.map((k) => (
                    <li key={k.url} className="rounded-xl border border-line bg-surface-card p-4">
                      {/* Testvér-termékre abszolút URL-lel, noreferrer NÉLKÜL — a hivatkozó lássa, honnan jött. */}
                      <a href={k.url} {...(k.termek !== 'nextbill' ? { rel: 'noopener' } : {})} className="font-semibold text-ink no-underline hover:text-sapph-hi">{k.cim}</a>
                      {k.termek !== 'nextbill' && <p className="m-0 mt-1 font-mono text-[12px] text-ink-dim">{k.nev} tudástár</p>}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
            <p className="mt-12 text-center"><Link href="/regisztracio" className="inline-flex items-center rounded-full bg-sapph px-7 py-3.5 text-[15px] font-bold text-white no-underline">Próbáld ki a NextBillt</Link></p>
          </article>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
```
(A `bg-surface-alt`/`site-section` osztályokat a `Section.tsx` `BG` térképéből vedd — ha más a név, azt használd.)

- [ ] **Step 11: Sitemap async + teszt**

`src/app/sitemap.ts`: `export default async function sitemap(): Promise<MetadataRoute.Sitemap>`; a statikus lista után:
```ts
  const tudastar = await tudastarSitemap()
  const tudastarTetelek: MetadataRoute.Sitemap = tudastar.length
    ? [
        { url: `${SITE_URL}/tudastar`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
        ...tudastar.map((t) => ({ url: t.url, lastModified: new Date(t.lastmod), changeFrequency: 'monthly' as const, priority: 0.6 })),
      ]
    : []
  return [...statikus, ...tudastarTetelek]
```
`src/app/sitemap.test.ts`: `sitemap()` → `await sitemap()`; a tetején `vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ url: 'https://nextbill.hu/tudastar/x', lastmod: '2026-09-18' }]), { headers: { 'content-type': 'application/json' } })))`; új teszt: „a tudástár cikkei a szolgáltatásból kerülnek a sitemapba" (`/tudastar` és `/tudastar/x` benne) + „üres tudástárnál nincs /tudastar" (mock `[]`).

- [ ] **Step 12: Fejléc + lábléc link** — `MarketingHeader.tsx` items: `{ label: 'Tudástár', href: '/tudastar', key: 'tudastar' }` az Árak után; `MarketingFooter.tsx` link-oszlopba `Tudástár → /tudastar` (a `legal-toc.test.ts`/lábléc-tesztek futtatása után igazítsd, ha valamelyik a linkek számát rögzíti).

- [ ] **Step 13: Forrás-szintű teszt** — `src/lib/tudastar.test.ts` végére:
```ts
import { readFileSync } from 'node:fs'
it('a cikk-lap a lap saját Organization @id-jét adja kiadónak, nem beégetett stringet', () => {
  const lap = readFileSync('src/app/tudastar/[slug]/page.tsx', 'utf8')
  expect(lap).toContain('orgId={ORG_ID}')
  expect(lap).not.toMatch(/publisher.*name:/)
})
```

- [ ] **Step 14: Tesztek + típus + build**

```bash
npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL"; npx tsc --noEmit 2>&1 | head -3
npm run build 2>&1 | grep -E "error|✓ Compiled|✓ Generating|tudastar" | head
```
Várható: a `/tudastar` `ƒ`/ISR, a `[slug]` 0 statikus lappal (még nincs NextBill-cikk) — a build zöld.

- [ ] **Step 15: Commit**

```bash
git add -A && git commit -m "feat(tudastar): /tudastar and /tudastar/[slug] from the knowledge-base service (ISR), sitemap, nav links

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: NextHub (`~/deploysapp`, `web/`, JS, Next 15)

**Files:**
- Create: `web/src/lib/tudastar.js`, `web/tests/tudastar.test.js`, `web/src/app/tudastar/page.js`, `web/src/app/tudastar/[slug]/page.js`, `web/src/components/tudastar/TudastarHtml.js`, `web/src/components/tudastar/TudastarJsonLd.js`
- Modify: `web/src/app/sitemap.js` (async), `web/tests/seoMetadata.test.js` (await + fetch mock), `web/src/components/public/SiteFooter.js` (link), `web/src/lib/jsonld.js` (`jsonLdHtml` már van)

- [ ] **Step 1: Worktree** — `cd ~/deploysapp && git fetch -q origin && git worktree add -q .claude/worktrees/tudastar-reteg -b feature/tudastar-reteg origin/master && cd .claude/worktrees/tudastar-reteg/web && npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -1 && npx vitest run 2>&1 | grep -E "Test Files|Tests "`

- [ ] **Step 2: Bukó teszt — `web/tests/tudastar.test.js`** (ugyanaz a három eset, JS-ben; a lista URL-je `…/v1/nexthub/index.json`; + a forrás-szintű `orgId={ORG_ID}` ellenőrzés `web/src/app/tudastar/[slug]/page.js`-re)

```js
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { tudastarCikk, tudastarLista, tudastarSitemap } from "../src/lib/tudastar.js";

const valasz = (adat, status = 200) => new Response(status === 200 ? JSON.stringify(adat) : "hiba", { status, headers: { "content-type": "application/json" } });
afterEach(() => vi.unstubAllGlobals());

describe("tudástár-kliens", () => {
  it("a lista a nexthub indexét kéri, óránkénti újraérvényesítéssel", async () => {
    const f = vi.fn(async () => valasz([{ slug: "a" }]));
    vi.stubGlobal("fetch", f);
    expect(await tudastarLista()).toEqual([{ slug: "a" }]);
    expect(f).toHaveBeenCalledWith("https://tudastar.next-soft.hu/v1/nexthub/index.json", expect.objectContaining({ next: { revalidate: 3600 } }));
  });
  it("ismeretlen cikk null, szerverhiba dob", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => valasz(null, 404)));
    expect(await tudastarCikk("nincs")).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => valasz(null, 500)));
    await expect(tudastarCikk("x")).rejects.toThrow(/500/);
  });
  it("a sitemap hibára üres listát ad", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("hálózat"); }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await tudastarSitemap()).toEqual([]);
  });
  it("a cikk-lap a NextHub Organization @id-jét adja kiadónak", () => {
    const lap = readFileSync(new URL("../src/app/tudastar/[slug]/page.js", import.meta.url), "utf8");
    expect(lap).toContain("orgId={ORG_ID}");
  });
});
```

- [ ] **Step 3: `web/src/lib/tudastar.js`** — a NextBill `tudastar.ts` JS-változata: `TUDASTAR_TERMEK = "nexthub"`, típusok nélkül, + `export const TEMA_CIMKE = { jogszabaly: "Szabályozás", gyakorlat: "Gyakorlat", penzugy: "Pénzügy" }`.

```js
// web/src/lib/tudastar.js — a tudástár-kliens (l. next-tudastar repó, src/kimenet.ts a JSON-szerződéshez).
// ISR óránként; build alatt elérhetetlen szolgáltatás = bukó build (generateStaticParams dob).
const BASE = (process.env.TUDASTAR_URL || "https://tudastar.next-soft.hu").replace(/\/+$/, "");
export const TUDASTAR_TERMEK = "nexthub";
export const TEMA_CIMKE = { jogszabaly: "Szabályozás", gyakorlat: "Gyakorlat", penzugy: "Pénzügy" };
const ISR = { next: { revalidate: 3600 } };

async function json(utvonal) {
  const r = await fetch(`${BASE}/v1/${TUDASTAR_TERMEK}/${utvonal}`, { ...ISR, headers: { accept: "application/json" } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`tudástár ${utvonal}: ${r.status}`);
  return r.json();
}
export async function tudastarLista() { return (await json("index.json")) ?? []; }
export async function tudastarCikk(slug) { return /^[a-z0-9-]+$/.test(slug) ? json(`${slug}.json`) : null; }
export async function tudastarSitemap() {
  try { return (await json("sitemap.json")) ?? []; }
  catch (e) { console.error("tudástár sitemap nem elérhető:", e.message); return []; }
}
```

- [ ] **Step 4: Komponensek** — `TudastarHtml.js`: ugyanaz az osztálylista, NextHub-tokenekkel (`text-ink`, `text-ink-muted`, `text-ink-dim`, `border-line`, `bg-surface-card`, link/akcent `text-hub-hi`, callout bal-keret `border-l-hub`). `TudastarJsonLd.js`: ugyanaz a gráf, `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(graf) }} />` a `web/src/lib/jsonld.js` `jsonLdHtml`-jével.

- [ ] **Step 5: Lapok** — `web/src/app/tudastar/page.js` és `[slug]/page.js`: a NextBill lapok JS-ben, `SiteHeader` a fejléc (a `SiteFooter`-t a gyökér-layout adja — NEM kell a lapra), `export const metadata`/`generateMetadata` sima objektum (`title`, `description`, `alternates: { canonical: '/tudastar/…' }`, üres listánál `robots: { index: false }`); a keret: `<div className="relative min-h-screen font-sans text-ink bg-surface"><div className="relative z-10"><SiteHeader />…</div></div>`; CTA: `/regisztracio` „Kezdés ingyen"; `ORG_ID`, `SITE_URL` a `../../../lib/jsonld.js`-ből (relatív importok, mint a többi lap). Lista-lap leírás: „Hosting, deploy és saját domain — kérdésekre válaszolva, DevOps nélkül. A NextHub tudástára."

- [ ] **Step 6: Sitemap async** — `web/src/app/sitemap.js`: `export default async function sitemap()`; a végén a tudástár-tételek (mint NextBill). `web/tests/seoMetadata.test.js`: minden `sitemap()` → `await sitemap()` (az `it`-ek `async`), a fájl tetején `vi.stubGlobal("fetch", …)` üres listával; + új teszt a tudástár-tételekre mockolt listával.

- [ ] **Step 7: Lábléc-link** — `SiteFooter.js`: a `/dokumentacio` mellé `{ href: "/tudastar", label: "Tudástár" }` (a lábléc-linkek tesztje: `tests/brandChrome.test.js` / `publicPagesBrand.test.js` — futtasd, igazítsd ha a linkszámot rögzíti). A `huRouting.test.js`/`routeSlugs.test.js` a magyar slugokat őrzi — a `/tudastar` magyar, rendben.

- [ ] **Step 8: Teszt + build + commit**

```bash
npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL"; npm run build 2>&1 | grep -E "error|✓ Compiled|✓ Generating|tudastar" | head
git add -A && git commit -m "feat(web): /tudastar from the knowledge-base service (ISR), sitemap, footer link

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: NextSoft (`~/gitrepos/nextsoft`, TS, Next 14 — `params` SZINKRON)

**Files:**
- Create: `src/lib/tudastar-tipusok.ts`, `src/lib/tudastar.ts`, `src/lib/tudastar.test.ts` (node:test), `src/app/(public)/tudastar/page.tsx`, `src/app/(public)/tudastar/[slug]/page.tsx`, `src/components/public/tudastar-html.tsx`, `src/components/public/tudastar-jsonld.tsx`
- Modify: `src/app/sitemap.ts` (async + tudástár), `src/components/public/site-footer.tsx` (link), `src/lib/jsonld.ts` (nincs változás — `NEXTSOFT_ORG_ID` az ORG_ID)

- [ ] **Step 1: Worktree** — `cd ~/gitrepos/nextsoft && git fetch -q origin && git worktree add -q .worktrees/tudastar-reteg -b feature/tudastar-reteg origin/main && cd .worktrees/tudastar-reteg && npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -1 && npx prisma generate 2>&1 | tail -1 && npm test 2>&1 | grep -E "^# (pass|fail)"`

- [ ] **Step 2: Teszt (`node:test`) — `src/lib/tudastar.test.ts`**

```ts
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tudastarCikk, tudastarLista, tudastarSitemap } from "./tudastar";

const eredeti = globalThis.fetch;
afterEach(() => { globalThis.fetch = eredeti; });
const valasz = (adat: unknown, status = 200) => new Response(status === 200 ? JSON.stringify(adat) : "hiba", { status });

test("a lista a nextsoft indexét kéri, óránkénti újraérvényesítéssel", async () => {
  let hivas: [string, RequestInit | undefined] | undefined;
  globalThis.fetch = (async (u: string, i?: RequestInit) => { hivas = [u, i]; return valasz([{ slug: "a" }]); }) as typeof fetch;
  assert.deepEqual(await tudastarLista(), [{ slug: "a" }]);
  assert.equal(hivas![0], "https://tudastar.next-soft.hu/v1/nextsoft/index.json");
  assert.deepEqual((hivas![1] as { next: unknown }).next, { revalidate: 3600 });
});
test("ismeretlen cikk null, szerverhiba dob", async () => {
  globalThis.fetch = (async () => valasz(null, 404)) as typeof fetch;
  assert.equal(await tudastarCikk("nincs"), null);
  globalThis.fetch = (async () => valasz(null, 500)) as typeof fetch;
  await assert.rejects(tudastarCikk("x"), /500/);
});
test("a sitemap hibára üres listát ad", async () => {
  globalThis.fetch = (async () => { throw new Error("hálózat"); }) as typeof fetch;
  const e = console.error; console.error = () => {};
  assert.deepEqual(await tudastarSitemap(), []);
  console.error = e;
});
test("a cikk-lap a Nextsoft Organization @id-jét adja kiadónak", () => {
  assert.match(readFileSync("src/app/(public)/tudastar/[slug]/page.tsx", "utf8"), /orgId=\{NEXTSOFT_ORG_ID\}/);
});
```

- [ ] **Step 3: `src/lib/tudastar-tipusok.ts` + `src/lib/tudastar.ts`** — a NextBill-fájlok másolata, `TUDASTAR_TERMEK = "nextsoft"`, dupla idézőjelek (a repó stílusa).

- [ ] **Step 4: Komponensek** — `tudastar-html.tsx`: az osztálylista NextSoft-tokenekkel (`text-ink`, `text-ink-muted`, `border-line`, akcent `text-aqua`, callout keret `border-l-aqua`, kártya `bg-surface-card` — ellenőrizd a `globals.css`/tailwind config nevét, a `(public)` lapok `bg-card`-ot vagy `bg-surface-card`-ot használnak). `tudastar-jsonld.tsx`: `<script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(graf).replace(/</g, "\\u003c") }} />`.

- [ ] **Step 5: Lapok (Next 14: `{ params }: { params: { slug: string } }`, NEM Promise)** — `(public)/tudastar/page.tsx`: `MarketingHero eyebrow="Tudástár" eyebrowIcon={BookOpen} title="Vállalkozás és" highlight="szoftver — érthetően." subtitle="…"` + `<Section band="page" ariaLabel="Cikkek">` a kártya-ráccsal; üres listánál „Az első cikkek hamarosan érkeznek." és `robots: { index: false }` a `generateMetadata`-ban. `[slug]/page.tsx`: `MarketingHero` (eyebrow = téma-címke, title = cim, subtitle = bevezeto) + `<Section band="page">` a törzzsel, forrásokkal, kapcsolódókkal, CTA `/arajanlat` („Kérj árajánlatot"). A `(public)` layout adja a fejlécet/láblécet — a lapra NEM kell. `metadata`: `{ title, description, alternates: { canonical: "/tudastar/<slug>" } }`.

- [ ] **Step 6: Sitemap** — `src/app/sitemap.ts` → `async`, a `PUBLIKUS_TERMEKEK` tételek után a tudástár-tételek (`/tudastar` 0.8 weekly + cikkek 0.7 monthly, csak ha van cikk). Ha a repóban van sitemap-teszt (`src/lib/*.test.ts` glob — a `sitemap.ts` az `app/` alatt van, a `npm test` nem éri), nincs teendő; a build a végső ellenőrzés.

- [ ] **Step 7: Lábléc** — `site-footer.tsx` „Cég" oszlop: `{ href: "/tudastar", label: "Tudástár" }` a GYIK után. A lábléc fejléce szerint „Minden link VALÓS, publikus lapra mutat" — a `/tudastar` az.

- [ ] **Step 8: Teszt + build + commit**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"; npx tsc --noEmit 2>&1 | head -3; npm run build 2>&1 | grep -E "error|✓ Compiled|✓ Generating|tudastar" | head
git add -A && git commit -m "feat(tudastar): /tudastar from the knowledge-base service (ISR), sitemap, footer link

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: NextWeblap (`~/gitrepos/nextweblap`, TS, Next 14, platform-hoszt)

**Files:**
- Create: `src/lib/tudastar-tipusok.ts`, `src/lib/tudastar.ts`, `src/lib/tudastar.test.ts` (vitest), `src/app/platform/tudastar/page.tsx`, `src/app/platform/tudastar/[slug]/page.tsx`, `src/components/platform/TudastarHtml.tsx`, `src/components/platform/TudastarJsonLd.tsx`
- Modify: `src/app/sitemap.ts` (platform-ág: tudástár-tételek), `src/components/platform/PlatformFooter.tsx` (link)

- [ ] **Step 1: Worktree** — `cd ~/gitrepos/nextweblap && git fetch -q origin && git worktree add -q .worktrees/tudastar-reteg -b feature/tudastar-reteg origin/main && cd .worktrees/tudastar-reteg && npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -1 && npx prisma generate 2>&1 | tail -1 && npx vitest run 2>&1 | grep -E "Test Files|Tests "`

- [ ] **Step 2: Teszt** — a NextBill vitest-teszt másolata: URL `…/v1/nextweblap/index.json`; forrás-szintű: `src/app/platform/tudastar/[slug]/page.tsx` tartalmazza `orgId={ORG_ID}`-t és `ORG_ID = platformOrgId(`-t.

- [ ] **Step 3: `lib/tudastar-tipusok.ts` + `lib/tudastar.ts`** — NextBill-másolat, `TUDASTAR_TERMEK = 'nextweblap'`, szimpla idézőjel, pontosvessző nélkül (a repó stílusa).

- [ ] **Step 4: Komponensek** — `TudastarHtml.tsx`: platform-tokenek (`text-platform-ink`, `text-platform-ink-muted`, `text-platform-ink-dim`, `border-platform-line`, `bg-platform-card`, akcent `text-brand-hi`, callout `border-l-brand-hi`). `TudastarJsonLd.tsx`: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graf).replace(/</g, '\\u003c') }} />`.

- [ ] **Step 5: Lapok** — `src/app/platform/tudastar/page.tsx`: a platform-lapok mintája (`Section`, `SectionTitle`, `Reveal`; hero: pirula „Tudástár" + `font-platform` h1 „Webshop-indítás és online eladás — érthetően" + `text-platform-ink-muted` lead; kártya-rács `bg-platform-card border-platform-line`). `[slug]/page.tsx` (Next 14, szinkron params): hero + törzs + források + kapcsolódók + CTA `/regisztracio` („Indítsd el a boltodat"). `const SITE_URL = 'https://nextweblap.hu'` (a platform-hoszt fix; a boltok nem kapják a lapot — a middleware csak platform-hoszton ír át `/platform/*`-ra) és `const ORG_ID = platformOrgId(SITE_URL)`. `metadata.alternates.canonical: `${SITE_URL}/tudastar/…`` (abszolút — a platform lapjai nem támaszkodnak `metadataBase`-re; ellenőrizd a `funkciok/page.tsx`-ben, kövesd azt). A platform layout adja a fejléc/láblécet.

- [ ] **Step 6: Sitemap** — `src/app/sitemap.ts` platform-ága (`!tenant`): a `lapok` tömb után `const tudastar = await tudastarSitemap()` és a tételek hozzáfűzése (`/tudastar` 0.7 weekly, cikkek 0.6 monthly, csak ha van). Ha van sitemap-teszt a repóban (`src/app/sitemap.test.ts`?), `fetch` mock hozzá.

- [ ] **Step 7: Lábléc** — `PlatformFooter.tsx`: a `/gyik` és `/sugo` közé `{ href: '/tudastar', label: 'Tudástár' }`.

- [ ] **Step 8: Teszt + build + commit** — `npx vitest run`, `npx tsc --noEmit`, `npm run build` (a `/platform/tudastar` és `[slug]` a listában); commit üzenet mint a Task 3-ban.

---

### Task 5: NextCég (`~/gitrepos/cegkereso`, TS, Next 16 — `params` Promise; `/blog` kivezetése)

**Files:**
- Create: `lib/tudastar-tipusok.ts`, `lib/tudastar.ts`, `lib/tudastar.test.ts` (node:test), `app/(public)/tudastar/page.tsx`, `app/(public)/tudastar/[slug]/page.tsx`, `app/components/tudastar/TudastarHtml.tsx`, `app/components/tudastar/TudastarJsonLd.tsx`
- Delete: `app/(public)/blog/page.tsx`, `app/(public)/blog/[slug]/page.tsx`, `app/api/admin/blog/route.ts` (+ minden `app/api/admin/blog/**`)
- Modify: `app/sitemap.ts` (blog ki, tudástár be), `next.config.ts` (`redirects`), `app/components/Footer.tsx` (`/blog` → `/tudastar`)

- [ ] **Step 1: Worktree** — `cd ~/gitrepos/cegkereso && git fetch -q origin && git worktree add -q .worktrees/tudastar-reteg -b feature/tudastar-reteg origin/main && cd .worktrees/tudastar-reteg && npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -1 && npx prisma generate 2>&1 | tail -1 && npm test 2>&1 | grep -E "^# (pass|fail)"`

- [ ] **Step 2: Teszt (`node:test`)** — a NextSoft-teszt másolata: URL `…/v1/nextceg/index.json`; forrás-szintű: `app/(public)/tudastar/[slug]/page.tsx` tartalmazza `orgId={ORG_ID}`-t; + „nincs /blog útvonal a fában": `assert.equal(existsSync("app/(public)/blog"), false)`; + „a /blog átirányít": a `next.config.ts` forrása tartalmazza `source: "/blog"` és `destination: "/tudastar"`.

- [ ] **Step 3: `lib/tudastar-tipusok.ts` + `lib/tudastar.ts`** — NextBill-másolat, `TUDASTAR_TERMEK = "nextceg"`, dupla idézőjel + pontosvessző (a repó stílusa).

- [ ] **Step 4: Komponensek** — `TudastarHtml.tsx`: NextCég-tokenek (`text-foreground`, `text-muted`, `border-border`, `bg-card`, akcent `text-primary`, callout `border-l-primary`). `TudastarJsonLd.tsx`: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graf).replace(/</g, "\\u003c") }} />`.

- [ ] **Step 5: Lapok (Next 16: `params: Promise<{ slug: string }>`)** — `(public)/tudastar/page.tsx`: `<div className="max-w-3xl mx-auto px-4 py-12">` + morzsa (`Főoldal › Tudástár`, `text-sm text-muted`) + `h1 text-3xl font-bold` „Tudástár" + lead + kártyák (`bg-card border border-border rounded-xl p-5`); `metadata` a `pageMetadata("Tudástár", LEIRAS, "/tudastar")`-ból, üresnél `robots: { index: false }` (`generateMetadata`). `[slug]/page.tsx`: ugyanaz a váz, `generateMetadata` `pageMetadata(c.metaCim, c.leiras, `/tudastar/${c.slug}`)`, CTA `/regisztracio` („Regisztráld a cégedet ingyen"). `SITE_URL`, `ORG_ID` a `@/lib/site` és `@/lib/jsonld`-ből. A `(public)` layout adja a Navbar/Footer-t.

- [ ] **Step 6: `/blog` kivezetése**
  - `git rm -r "app/(public)/blog" app/api/admin/blog`
  - `app/sitemap.ts`: a `{ url: `${BASE_URL}/blog` … }` sor és a `blogPosts`/`blogPages` blokk ki; helyette `const tudastar = await tudastarSitemap()` + tételek (`/tudastar` 0.7 weekly, cikkek 0.6 monthly, csak ha van); a `return` listából `blogPages` ki, `tudastarPages` be.
  - `next.config.ts`: a `headers()` mellé
    ```ts
    async redirects() {
      // A /blog sosem kapott tartalmat; a tudástár váltja (2026-09-18). 308: a régi URL végleg megszűnt.
      return [
        { source: "/blog", destination: "/tudastar", permanent: true },
        { source: "/blog/:slug", destination: "/tudastar", permanent: true },
      ];
    },
    ```
  - `app/components/Footer.tsx`: `["/blog","Tudástár"]` → `["/tudastar","Tudástár"]`.
  - `git grep -n "/blog\|blogPost" -- app lib` → üres legyen (a Prisma-modell marad; a séma-törlés külön kör, komment a `schema.prisma` `BlogPost` fölé: „2026-09-18: a /blog megszűnt, a tudástár a next-tudastar szolgáltatásból jön; a modell törlése külön kör").

- [ ] **Step 7: Teszt + build + commit** — `npm test`, `npx tsc --noEmit`, `npm run build` (nincs `/blog` a route-listában, van `/tudastar`); commit: „feat(tudastar): /tudastar from the knowledge-base service (ISR); /blog retired with 308 redirects, sitemap and footer updated".

---

### Task 6: Push mind az öt repóra → deploy → élő ellenőrzés

- [ ] **Step 1: Push** (mindegyik worktree-ből fast-forward ellenőrzéssel):

```bash
for wt in ~/gitrepos/szamlazo/.worktrees/tudastar-reteg ~/gitrepos/nextsoft/.worktrees/tudastar-reteg ~/gitrepos/nextweblap/.worktrees/tudastar-reteg ~/gitrepos/cegkereso/.worktrees/tudastar-reteg; do
  (cd $wt && git fetch -q origin && git merge-base --is-ancestor origin/main HEAD && git push -q origin feature/tudastar-reteg:main && echo "$wt → pushed") || echo "!! $wt: rebase kell"
done
cd ~/deploysapp/.claude/worktrees/tudastar-reteg && git fetch -q origin && git merge-base --is-ancestor origin/master HEAD && git push -q origin feature/tudastar-reteg:master && echo "deploysapp → pushed"
```
NextHub web: a fő checkoutban `git pull --ff-only origin master && docker compose up -d --build platform-web`.

- [ ] **Step 2: Buildek** — `scratchpad/buildwait.sh 20 <service-id…>` (szamlazo-web `cmmw0e3pn04eut80127au6u25`, nextsoft `cmoa2x0je0vl9nu01jbg39scj`, nextweblap `cmrqkaj3y50remw011qvzk6d6`, cegkereso `cmmmanjsk0irbqi015ayajopo`) → mind `success`.

- [ ] **Step 3: Élő ellenőrzés** (nyers HTML):

```bash
for d in nextbill.hu nexthub.hu next-soft.hu nextweblap.hu nextceg.hu; do
  printf "%-14s /tudastar=%s noindex=%s  nincs-ilyen=%s  sitemap-tudastar=%s\n" $d \
    "$(curl -s -o /dev/null -w '%{http_code}' https://$d/tudastar)" \
    "$(curl -s https://$d/tudastar | grep -c 'noindex')" \
    "$(curl -s -o /dev/null -w '%{http_code}' https://$d/tudastar/nincs-ilyen-cikk)" \
    "$(curl -s https://$d/sitemap.xml | grep -c '/tudastar')"
done
curl -s -o /dev/null -w "nextceg /blog → %{http_code} %{redirect_url}\n" https://nextceg.hu/blog
```
Várható: 200 / noindex ≥1 (még nincs cikk) / 404 / 0; a `/blog` 308 → `/tudastar`.

---

### Task 7: Lezárás

- [ ] Worktree-k törlése (5 repó), a `deploysapp` `feature/tudastar-reteg` ág törlése.
- [ ] Memória: `project_tudastar_service_live.md` — 3a kész; a 3b (cikkek) a következő; oldalanként a `lib/tudastar` + a lapok helye.
- [ ] Jelentés: a 3b tervhez a 20 téma és a PR-menet (termékenként egy ág a `next-tudastar`-ban).

## Önellenőrzés

- Spec 4.1 útvonalak (5 oldal + NextWeblap platform + NextCég /blog 308) → T1–T5; 4.2 ISR + bukó build + üres-eset → minden `lib/tudastar` + `generateStaticParams`; 4.3 (lista, cikk, TOC, kapcsolódó, források, CTA, BlogPosting+Breadcrumb `@id`-vel, sitemap `lastmod`, canonical/OG) → T1 minta + T2–T5; 4.4 (referencia-implementáció + helyi másolat, a JSON-séma a szolgáltatásban rögzített) → `tudastar-tipusok` másolatok; 4.5 sorrend 3. lépés → T6.
- Nevek egységesek: `tudastarLista/tudastarCikk/tudastarSitemap`, `TEMA_CIMKE`, `TudastarHtml`, `TudastarJsonLd`, `TUDASTAR_TERMEK`.
- Tudatos döntés: az üres tudástár `noindex` — 3b-ig egyik oldal sem hirdet üres listát a keresőnek; a lábléc-link viszont már kint van (belső link a majdani cikkekhez).
