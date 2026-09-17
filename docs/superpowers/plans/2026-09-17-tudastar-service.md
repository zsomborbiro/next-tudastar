# Tudástár 1. terv: tartalom-repó + őrző-tesztek + NextRaktár-import + szolgáltatás élesben

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `next-tudastar` repó, amely markdown cikkekből őrző-tesztekkel védett, kész HTML+JSON-t generál, és NextHub-service-ként a `https://tudastar.next-soft.hu/v1/…` címen szolgálja ki — benne a NextRaktár 22 meglévő cikkével.

**Architecture:** Build idején (Dockerfile) futnak a tesztek és a generálás (`src/build.ts` → `dist/`), futásidőben egy függőség nélküli Node HTTP-szerver (`src/server.ts`) csak a `dist/`-et szolgálja ki ETag/Cache-Control fejlécekkel. Minden állapot a git-repóban; nincs adatbázis.

**Tech Stack:** Node 20, TypeScript (ESM), `tsx` (scriptek + `node:test` futtatás), `markdown-it` + `markdown-it-container` (callout), `gray-matter` (frontmatter), `zod` (séma). Docker multi-stage. NextHub deploy (MCP `deploysapp_*` eszközök), Cloudflare DNS API.

**Spec:** `docs/superpowers/specs/2026-09-17-tudastar-design.md` (ugyanebben a repóban)

## Global Constraints

- Repó: `/home/kincsemgodlinux/gitrepos/next-tudastar` (már létezik, `main` ág, a spec commitolva). Git identity: `zsomborbiro <zsombor200007@gmail.com>` (repó-szinten beállítva). Remote később: `git@github.com:zsomborbiro/next-tudastar.git`.
- Nyelv: kód-kommentek, hibaüzenetek, tesztnevek **magyarul**; commit-üzenetek **angolul**; minden commit végén: `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Tesztfuttató: `node:test` `tsx`-en keresztül — `npm test` = `tsx --test tests/*.test.ts`. Új tesztfájlt a `tests/` alá kell tenni, a glob felveszi.
- Cikk-fejléc mezők (spec 2.2 + `bevezeto`): `termek, slug, cim, metaCim?, bevezeto, leiras, tema, megjelent, frissitve?, forrasok?, ellenorizve?, kapcsolodo[]`.
- Szabály-értékek: `leiras` 100–165 karakter; min. 600 szó; olvasási perc = `max(1, round(szavak/200))`; `kapcsolodo` ≥ 2.
- Termékek (`termekek.json`, mind a hat): `nextraktar` (nev `nextraktár`, `nincsProbaido: true`, `nincsKartyasFizetes: true`), `nextbill` (NextBill), `nexthub` (NextHub), `nextceg` (NextCég), `nextweblap` (NextWeblap), `nextsoft` (Nextsoft) — a többinél mindkét kapcsoló `false`. Domain `https://<termek>.hu`, kivéve `nextsoft` → `https://next-soft.hu`. `orgId` = `<domain>/#organization`.
- Elsődleges forrás-domainek (évszám-kivételhez): `nav.gov.hu`, `magyarorszag.hu`, `njt.hu`, `europa.eu`.
- HTML-kimenet engedett elemei: `p, h2, h3, ul, ol, li, strong, em, a, img, blockquote, code, pre, div` (a `div` csak `class="tudastar-callout"`), képnél `class="tudastar-kep"`.
- Szolgáltatás: `PORT` env (alapérték 3000), `DIST` env (alapérték `./dist`). `Cache-Control: public, max-age=300`, `ETag`, `Access-Control-Allow-Origin: *`. `robots.txt` → `User-agent: *\nDisallow: /`.
- NextHub: a service a `zsombor200007@gmail.com` fiók alatt; custom domain `tudastar.next-soft.hu` → Cloudflare CNAME `edge.deploysapp.com` (DNS-only, mint `id.next-soft.hu`), zone id a `~/.config/claude-bootstrap/cloudflare-zones.json`-ból.
- A NextRaktár forrás: `/home/kincsemgodlinux/gitrepos/nextraktar-web` — **a fő checkout feature-ágon áll, piszkos fával**: az importhoz az `origin/main` állapotát kell használni (`git show origin/main:site/src/lib/knowledge.ts` egy ideiglenes könyvtárba).

---

### Task 1: Repó-váz, függőségek, `termekek.json`

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.server.json`, `.gitignore`, `.dockerignore`, `termekek.json`, `CLAUDE.md`, `src/tipusok.ts`, `src/termekek.ts`
- Test: `tests/termekek.test.ts`

**Interfaces:**
- Produces: `src/tipusok.ts` — `Tema`, `Forras`, `CikkMeta`, `Cikk`, `Termek`, `Termekek`; `src/termekek.ts` — `betoltTermekek(fajl?: string): Termekek`, `TERMEKEK` (a gyökér `termekek.json` betöltve).

- [ ] **Step 1: package.json és tsconfig-ok**

```json
{
  "name": "next-tudastar",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "tsx --test tests/*.test.ts",
    "build": "tsx src/build.ts && tsc -p tsconfig.server.json",
    "start": "node build/server.js",
    "dev": "npm run build && node build/server.js"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "markdown-it": "^14.1.0",
    "markdown-it-container": "^4.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/markdown-it": "^14.1.2",
    "@types/markdown-it-container": "^2.0.10",
    "@types/node": "^20.14.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext",
    "strict": true, "esModuleInterop": true, "skipLibCheck": true,
    "resolveJsonModule": true, "noEmit": true, "types": ["node"]
  },
  "include": ["src", "tests", "scripts"]
}
```

`tsconfig.server.json` (csak a szerver fordul JS-re, függőség nélkül):
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": false, "outDir": "build", "rootDir": "src" },
  "include": ["src/server.ts"]
}
```

`.gitignore`:
```
node_modules/
dist/
build/
.worktrees/
```

`.dockerignore`:
```
node_modules
dist
build
.git
.worktrees
docs
```

- [ ] **Step 2: `termekek.json` (mind a hat termék)**

```json
{
  "nextraktar": { "nev": "nextraktár", "domain": "https://nextraktar.hu", "orgId": "https://nextraktar.hu/#organization", "szabalyok": { "nincsProbaido": true,  "nincsKartyasFizetes": true  } },
  "nextbill":   { "nev": "NextBill",   "domain": "https://nextbill.hu",   "orgId": "https://nextbill.hu/#organization",   "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } },
  "nexthub":    { "nev": "NextHub",    "domain": "https://nexthub.hu",    "orgId": "https://nexthub.hu/#organization",    "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } },
  "nextceg":    { "nev": "NextCég",    "domain": "https://nextceg.hu",    "orgId": "https://nextceg.hu/#organization",    "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } },
  "nextweblap": { "nev": "NextWeblap", "domain": "https://nextweblap.hu", "orgId": "https://nextweblap.hu/#organization", "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } },
  "nextsoft":   { "nev": "Nextsoft",   "domain": "https://next-soft.hu",  "orgId": "https://next-soft.hu/#organization",  "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } }
}
```

- [ ] **Step 3: `src/tipusok.ts`**

```ts
// A tudástár közös típusai. A cikk-fejléc sémája a `cikk.ts`-ben (zod), a
// termék-katalógusé a `termekek.ts`-ben — ez a fájl csak a TS-alakot adja.

export type Tema = 'jogszabaly' | 'gyakorlat' | 'penzugy'

export interface Forras { cim: string; url: string }

export interface CikkMeta {
  termek: string
  slug: string
  /** A cím, márkanév NÉLKÜL — a termék-lap sablonja teszi hozzá. */
  cim: string
  /** Opcionális rövidebb <title>; ha nincs, a `cim`. */
  metaCim?: string
  /** A lead — a lap kiemelten, a törzs előtt mutatja. */
  bevezeto: string
  /** Meta description, 100–165 karakter. */
  leiras: string
  tema: Tema
  /** ISO dátum (YYYY-MM-DD). */
  megjelent: string
  /** Az utolsó ÉRDEMI változás — csak akkor, ha van. */
  frissitve?: string
  forrasok?: Forras[]
  ellenorizve?: string
  /** `termek/slug` hivatkozások — testvér-termékre is. */
  kapcsolodo: string[]
}

export interface Cikk extends CikkMeta {
  /** A törzs markdownja (fejléc nélkül). */
  markdown: string
  /** A forrásfájl a repó gyökerétől — hibaüzenetekhez. */
  fajl: string
}

export interface Termek {
  nev: string
  domain: string
  orgId: string
  szabalyok: { nincsProbaido: boolean; nincsKartyasFizetes: boolean }
}

export type Termekek = Record<string, Termek>
```

- [ ] **Step 4: Bukó teszt a termék-katalógusra**

`tests/termekek.test.ts`:
```ts
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
```

`tests/fixtures/rossz-termekek.json`:
```json
{ "x": { "nev": "X", "domain": "https://x.hu", "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false } } }
```

- [ ] **Step 5: Futtasd, bukjon**

Run: `cd /home/kincsemgodlinux/gitrepos/next-tudastar && npm install && npm test`
Expected: FAIL — `Cannot find module '../src/termekek.ts'`

- [ ] **Step 6: `src/termekek.ts`**

```ts
import { readFileSync } from 'node:fs'
import { z } from 'zod'
import type { Termekek } from './tipusok.ts'

const TermekSema = z.object({
  nev: z.string().min(1),
  domain: z.string().regex(/^https:\/\/[a-z.-]+$/, 'https:// és záró perjel nélkül'),
  orgId: z.string().url(),
  szabalyok: z.object({ nincsProbaido: z.boolean(), nincsKartyasFizetes: z.boolean() }),
})

/** A termék-katalógus betöltése és ellenőrzése. Hiba esetén dob — a build ne fusson tovább. */
export function betoltTermekek(fajl = 'termekek.json'): Termekek {
  const nyers = JSON.parse(readFileSync(fajl, 'utf8'))
  const eredmeny = z.record(z.string().regex(/^[a-z]+$/), TermekSema).safeParse(nyers)
  if (!eredmeny.success) {
    throw new Error(`termekek.json hibás: ${eredmeny.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }
  return eredmeny.data
}

export const TERMEKEK: Termekek = betoltTermekek()
```

- [ ] **Step 7: Futtasd, menjen át**

Run: `npm test`
Expected: 3 passed

- [ ] **Step 8: `CLAUDE.md` (lokál-only, a repó saját útmutatója — commitoljuk, ez nem a globális)**

```markdown
# next-tudastar — a Next-család közös tudástára

Spec: `docs/superpowers/specs/2026-09-17-tudastar-design.md`. Terv: `docs/superpowers/plans/`.

- Cikkek: `cikkek/<termek>/<slug>.md`, YAML-fejléccel (mezők: `src/cikk.ts`). Egy cikk = egy fájl.
- `npm test` = őrző-tesztek MINDEN cikkre — bukó teszt = nincs deploy (a Dockerfile futtatja).
- `npm run build` → `dist/v1/<termek>/{index,sitemap,<slug>}.json` + `build/server.js`.
- Élő: `https://tudastar.next-soft.hu/v1/<termek>/index.json`. Fogyasztók: a hat termék-oldal `/tudastar` útvonala.
- Új cikk: ág → cikk → `npm test` zöld → PR → merge → a NextHub 1 percen belül deployol, az oldalak ≤1 óra (ISR).
- Commit angolul; kód-komment, tesztnév magyarul.
```

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "chore: repo scaffold, product catalog with validation

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Egy cikk beolvasása és fejléc-séma

**Files:**
- Create: `src/cikk.ts`, `tests/fixtures/cikkek/nextbill/minta.md`, `tests/fixtures/cikkek/nextbill/rossz-fejlec.md`
- Test: `tests/cikk.test.ts`

**Interfaces:**
- Consumes: `Cikk`, `Termekek` (Task 1).
- Produces: `olvasCikk(fajl: string, termekek: Termekek): Cikk` — a fájlból; dob, ha a fejléc hibás, a `termek` ismeretlen, vagy a `slug` ≠ fájlnév. `szovegCikk(c: Cikk): string` — a cím + bevezető + leírás + a markdown törzs *szövege* (jelölők nélkül) — az őrző-szabályok és a szószám ezt nézik. `szoszam(c)`, `olvasasiPerc(c)`.

- [ ] **Step 1: Fixture-ök**

`tests/fixtures/cikkek/nextbill/minta.md` (a törzs ≥ 600 szó legyen — töltsd fel értelmes, összegmentes magyar szöveggel; ide a fejléc és a szerkezet a lényeg):
```markdown
---
termek: nextbill
slug: minta
cim: "Minta cikk a tesztekhez"
bevezeto: "Ez a cikk csak a tesztek kedvéért létezik, de a szerkezete valódi."
leiras: "Minta meta-leírás, ami elég hosszú ahhoz, hogy a kereső által mutatott sávba essen, és ne bukjon el az őrző-teszten sem."
tema: gyakorlat
megjelent: 2026-09-17
kapcsolodo:
  - nextbill/masik
  - nextraktar/harmadik
---

## Első szakasz

Bekezdés **félkövérrel** és [linkkel](https://nav.gov.hu/).

:::callout Figyelem
Ez egy kiemelt doboz.
:::

![Képfelirat](https://nextraktar.hu/shots/penztar-1600.webp "1600x900")

## Második szakasz

- egy
- kettő

<script>alert(1)</script>

(… további bekezdések, hogy 600 szó fölé menjen …)
```

`tests/fixtures/cikkek/nextbill/rossz-fejlec.md`:
```markdown
---
termek: nextbill
slug: mas-nev
cim: "Hiányzik a bevezető"
leiras: "rövid"
tema: valami
megjelent: 2026-9-1
kapcsolodo: []
---
Szöveg.
```

- [ ] **Step 2: Bukó teszt**

`tests/cikk.test.ts`:
```ts
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
```

- [ ] **Step 3: Futtasd, bukjon**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/cikk.ts'`

- [ ] **Step 4: `src/cikk.ts`**

```ts
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import type { Cikk, Termekek } from './tipusok.ts'

const ISO = /^\d{4}-\d{2}-\d{2}$/

const FejlecSema = z.object({
  termek: z.string().regex(/^[a-z]+$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kisbetű, szám, kötőjel'),
  cim: z.string().min(10),
  metaCim: z.string().min(10).optional(),
  bevezeto: z.string().min(40),
  leiras: z.string().min(100, 'legalább 100 karakter').max(165, 'legfeljebb 165 karakter'),
  tema: z.enum(['jogszabaly', 'gyakorlat', 'penzugy']),
  megjelent: z.string().regex(ISO, 'YYYY-MM-DD'),
  frissitve: z.string().regex(ISO, 'YYYY-MM-DD').optional(),
  forrasok: z.array(z.object({ cim: z.string().min(6), url: z.string().regex(/^https:\/\//) })).optional(),
  ellenorizve: z.string().regex(ISO, 'YYYY-MM-DD').optional(),
  kapcsolodo: z.array(z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'termek/slug alak')),
})

/** Egy markdown fájl → Cikk. Dob, ha a fejléc hibás; a hibaüzenet MINDEN mezőhibát felsorol. */
export function olvasCikk(fajl: string, termekek: Termekek): Cikk {
  const { data, content } = matter(readFileSync(fajl, 'utf8'))
  const e = FejlecSema.safeParse(data)
  if (!e.success) {
    const hibak = e.error.issues.map((i) => `${i.path.join('.') || '(fejléc)'}: ${i.message}`)
    throw new Error(`${fajl}: hibás fejléc — ${hibak.join('; ')}`)
  }
  const meta = e.data
  if (!termekek[meta.termek]) throw new Error(`${fajl}: ismeretlen termék: ${meta.termek}`)
  const fajlSlug = basename(fajl, '.md')
  if (fajlSlug !== meta.slug) throw new Error(`${fajl}: a slug (${meta.slug}) nem egyezik a fájlnévvel (${fajlSlug})`)
  return { ...meta, markdown: content.trim(), fajl }
}

/**
 * A cikk teljes szövege jelölők nélkül — az őrző-szabályok és a szószám alapja.
 * Nem HTML-ből, hanem a markdownból: nyers HTML-t (pl. <script>) is ki kell dobni,
 * hogy a szószámot ne tornázza fel.
 */
export function szovegCikk(c: Cikk): string {
  const torzs = c.markdown
    .replace(/<[^>]+>/g, ' ')                       // nyers HTML ki
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')       // kép → felirat
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')        // link → szöveg
    .replace(/^:::callout\s*(.*)$/gm, '$1')         // callout nyitó → címe
    .replace(/^:::\s*$/gm, '')
    .replace(/^#{2,3}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
  return [c.cim, c.bevezeto, c.leiras, torzs].join(' ').replace(/\s+/g, ' ').trim()
}

export function szoszam(c: Cikk): number {
  return szovegCikk(c).split(' ').filter((w) => w.length > 0).length
}

/** ~200 szó/perc magyar szövegre, legalább 1. Számított, nem tárolt — nem tud elavulni. */
export function olvasasiPerc(c: Cikk): number {
  return Math.max(1, Math.round(szoszam(c) / 200))
}
```

- [ ] **Step 5: Futtasd, menjen át**

Run: `npm test`
Expected: minden zöld (a minta-fixture törzsét addig bővítsd, amíg ≥ 600 szó — jelölők nélkül).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: article reader with validated frontmatter, plain-text extraction and reading time

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Az összes cikk begyűjtése és a `kapcsolodo` feloldása

**Files:**
- Create: `src/gyujtes.ts`, `tests/fixtures/cikkek/nextbill/masik.md`, `tests/fixtures/cikkek/nextraktar/harmadik.md`
- Test: `tests/gyujtes.test.ts`

**Interfaces:**
- Consumes: `olvasCikk` (Task 2), `Termekek`.
- Produces: `gyujtCikkek(gyoker: string, termekek: Termekek): Cikk[]` — rekurzívan `<gyoker>/<termek>/*.md`, determinisztikus sorrend (termék, majd slug). `kulcs(c) = \`${c.termek}/${c.slug}\``. `feloldKapcsolodo(cikkek: Cikk[]): Map<string, Cikk>` — dob, ha egy hivatkozás nem létező cikkre vagy önmagára mutat, vagy < 2.

- [ ] **Step 1: Fixture-ök** — `masik.md` (nextbill) és `harmadik.md` (nextraktar), mindkettő érvényes fejléccel (≥ 600 szó, `kapcsolodo` egymásra + a `minta`-ra), a `harmadik.md` `tema: jogszabaly` legyen `forrasok` NÉLKÜL és évszám nélkül.

- [ ] **Step 2: Bukó teszt**

`tests/gyujtes.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gyujtCikkek, feloldKapcsolodo, kulcs } from '../src/gyujtes.ts'
import { TERMEKEK } from '../src/termekek.ts'

test('a fixture-mappa minden cikkét felveszi, termék és slug szerint rendezve', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK).filter((c) => c.slug !== 'rossz-fejlec')
  assert.deepEqual(cikkek.map(kulcs), ['nextbill/masik', 'nextbill/minta', 'nextraktar/harmadik'])
})

test('a kapcsolódó hivatkozások feloldódnak', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, { kihagy: ['rossz-fejlec'] })
  const terkep = feloldKapcsolodo(cikkek)
  assert.equal(terkep.get('nextbill/minta')?.cim, 'Minta cikk a tesztekhez')
})

test('nem létező kapcsolódó cikk hibát dob, a hivatkozó nevével', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, { kihagy: ['rossz-fejlec'] })
  cikkek[0].kapcsolodo = ['nexthub/nincs-ilyen', 'nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /nextbill\/masik.*nexthub\/nincs-ilyen/)
})

test('önhivatkozás és kettőnél kevesebb kapcsolódó nem megy át', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, { kihagy: ['rossz-fejlec'] })
  cikkek[0].kapcsolodo = ['nextbill/masik', 'nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /önmagára/)
  cikkek[0].kapcsolodo = ['nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /legalább 2/)
})
```

- [ ] **Step 3: Futtasd, bukjon** — Run: `npm test` — Expected: FAIL, `Cannot find module '../src/gyujtes.ts'`

- [ ] **Step 4: `src/gyujtes.ts`**

```ts
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { olvasCikk } from './cikk.ts'
import type { Cikk, Termekek } from './tipusok.ts'

export const kulcs = (c: Pick<Cikk, 'termek' | 'slug'>) => `${c.termek}/${c.slug}`

/**
 * `<gyoker>/<termek>/<slug>.md` → Cikk[]; determinisztikus sorrend, hogy a build
 * kimenete ugyanarra a bemenetre bájtra ugyanaz legyen.
 * `kihagy`: slugok, amiket nem olvasunk be (a rossz fixture-ökhöz a tesztekben).
 */
export function gyujtCikkek(gyoker: string, termekek: Termekek, opts: { kihagy?: string[] } = {}): Cikk[] {
  const kihagy = new Set(opts.kihagy ?? [])
  const cikkek: Cikk[] = []
  for (const termek of readdirSync(gyoker).sort()) {
    const mappa = join(gyoker, termek)
    if (!statSync(mappa).isDirectory()) continue
    if (!termekek[termek]) throw new Error(`${mappa}: nincs ilyen termék a termekek.json-ban`)
    for (const f of readdirSync(mappa).filter((f) => f.endsWith('.md')).sort()) {
      if (kihagy.has(f.replace(/\.md$/, ''))) continue
      const c = olvasCikk(join(mappa, f), termekek)
      if (c.termek !== termek) throw new Error(`${c.fajl}: a fejléc ${c.termek} terméket mond, de a ${termek} mappában van`)
      cikkek.push(c)
    }
  }
  return cikkek
}

/** A `kapcsolodo` hivatkozások ellenőrzése; a térkép kulcsa `termek/slug`. */
export function feloldKapcsolodo(cikkek: Cikk[]): Map<string, Cikk> {
  const terkep = new Map(cikkek.map((c) => [kulcs(c), c]))
  const hibak: string[] = []
  for (const c of cikkek) {
    if (c.kapcsolodo.length < 2) hibak.push(`${kulcs(c)}: legalább 2 kapcsolódó cikk kell`)
    for (const k of c.kapcsolodo) {
      if (k === kulcs(c)) hibak.push(`${kulcs(c)}: önmagára hivatkozik`)
      else if (!terkep.has(k)) hibak.push(`${kulcs(c)}: nem létező kapcsolódó cikk: ${k}`)
    }
  }
  if (hibak.length) throw new Error(hibak.join('\n'))
  return terkep
}
```

- [ ] **Step 5: Futtasd, menjen át** — Run: `npm test`

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: collect articles deterministically and resolve related links

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Őrző-szabályok (tiszta függvények)

**Files:**
- Create: `src/szabalyok.ts`
- Test: `tests/szabalyok.test.ts`

**Interfaces:**
- Consumes: `Cikk`, `Termek`, `szovegCikk`, `szoszam`.
- Produces: `ellenorizCikk(c: Cikk, t: Termek, ma?: string): string[]` — a szabálysértések listája (üres = rendben); `ellenorizTermek(cikkek: Cikk[], t: Termek): string[]` — termék-szintű (egyedi cím, témák). Mindegyik üzenet `termek/slug: …` alakú.

- [ ] **Step 1: Bukó teszt — minden szabályra egy pozitív és egy negatív eset**

`tests/szabalyok.test.ts`:
```ts
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
```

- [ ] **Step 2: Futtasd, bukjon** — `npm test` → `Cannot find module '../src/szabalyok.ts'`

- [ ] **Step 3: `src/szabalyok.ts`**

```ts
import { szovegCikk, szoszam } from './cikk.ts'
import { kulcs } from './gyujtes.ts'
import type { Cikk, Termek } from './tipusok.ts'

// A NextRaktár `knowledge.test.ts` szabályai (2026-08-10 → 2026-09-12), termékenként
// kapcsolható részekkel. A tudástár tartalmi kockázata más, mint a marketingé:
// egy beégetett díjtétel vagy hatálydátum némán hamissá válik, és a cég neve
// alatt megy ki. Ezért nincs összeg, nincs paragrafus, nincs kitalált szám.

export const ELSODLEGES_FORRASOK = ['nav.gov.hu', 'magyarorszag.hu', 'njt.hu', 'europa.eu']
export const CSALADI_DOMAINEK = ['nextraktar.hu', 'nextbill.hu', 'nexthub.hu', 'nextceg.hu', 'nextweblap.hu', 'next-soft.hu']

/**
 * Az őr ÍGÉRETET tilt, nem szóelőfordulást: a „próbaidőszak nincs" a legőszintébb
 * mondat, amit adhatunk — a tagadó fordulatokat kivesszük a keresés ELŐTT.
 * Pozitív állítás („14 napig ingyen") ugyanúgy fennakad, abban nincs tagadás.
 */
const TAGADASOK = [
  /(ingyenes\s+)?próbaidőszak\s+nincs/g,
  /nincs\s+(ingyenes\s+)?próbaidőszak/g,
  /nincs\s+ingyenes\s+próba/g,
]
const PROBA_IGERETEK = ['14 nap', 'próbaidőszak', 'ingyenes próba', 'tizennégy nap']
// A BOLT VEVŐINEK kártyás fizetése sosem tiltott — ezért nincs csupasz „bankkártya" a listán.
const KARTYA_IGERETEK = ['stripe', 'megadod a bankkártyád', 'kártyaadatai', 'automatikusan levonásra kerül', 'automatikusan levonjuk', 'levonjuk a kártyádról']

function elsodleges(url: string): boolean {
  try { const h = new URL(url).hostname; return ELSODLEGES_FORRASOK.some((d) => h === d || h.endsWith(`.${d}`)) } catch { return false }
}
function csaladi(url: string): boolean {
  try { const h = new URL(url).hostname; return CSALADI_DOMAINEK.some((d) => h === d || h.endsWith(`.${d}`)) } catch { return false }
}

/** Egy cikk szabálysértései. `ma`: ISO dátum a „jövőbeli" ellenőrzéshez (tesztelhetőség). */
export function ellenorizCikk(c: Cikk, t: Termek, ma = new Date().toISOString().slice(0, 10)): string[] {
  const id = kulcs(c)
  const h: string[] = []
  const szoveg = szovegCikk(c)
  const kis = szoveg.toLowerCase()

  if (/\d[\d\s .]*(Ft|forint)\b/i.test(szoveg)) h.push(`${id}: beégetett összeg — összeg nem állhat cikkben (elavul)`)
  if (c.tema === 'jogszabaly' && /\d+\s*§|\bszakasz\s*\(\d/.test(szoveg)) h.push(`${id}: paragrafus-hivatkozás jogszabályi cikkben`)
  if (c.tema === 'jogszabaly' && /\b(19|20)\d{2}\b/.test(szoveg)) {
    const forras = (c.forrasok ?? []).some((f) => elsodleges(f.url))
    if (!(c.forrasok ?? []).length) h.push(`${id}: évszám van benne, de nincs forrása`)
    else if (!forras) h.push(`${id}: évszám van benne, de nincs elsődleges forrása (${ELSODLEGES_FORRASOK.join(', ')})`)
    if (!c.ellenorizve) h.push(`${id}: évszám van benne, de nincs ellenőrzési dátuma`)
  }
  if (c.ellenorizve) {
    if (c.ellenorizve < c.megjelent) h.push(`${id}: az ellenőrzés korábbi a megjelenésnél`)
    if (c.ellenorizve > ma) h.push(`${id}: jövőbeli ellenőrzési dátum`)
  }
  if (c.megjelent > ma) h.push(`${id}: jövőbeli megjelenés`)
  if (c.frissitve && c.frissitve < c.megjelent) h.push(`${id}: a frissítés korábbi a megjelenésnél`)
  if (/\d+\s*%/.test(szoveg)) h.push(`${id}: százalékos adat — kitalált statisztika tilos`)
  if (/\b\d+\s*(bolt|ügyfél|felhasználó|cég|vásárló)\b/i.test(szoveg)) h.push(`${id}: darabszám — kitalált statisztika tilos`)
  if (t.szabalyok.nincsProbaido) {
    const igeret = TAGADASOK.reduce((acc, re) => acc.replace(re, ''), kis)
    for (const p of PROBA_IGERETEK) if (igeret.includes(p)) h.push(`${id}: próbaidő-ígéret („${p}"), pedig a termék nem ad próbát`)
  }
  if (t.szabalyok.nincsKartyasFizetes) {
    for (const k of KARTYA_IGERETEK) if (kis.includes(k)) h.push(`${id}: kártyás fizetés ígérete („${k}"), pedig a termék számlát és átutalást ad`)
  }
  if (szoszam(c) < 600) h.push(`${id}: legalább 600 szó kell (${szoszam(c)})`)
  if (new RegExp(t.nev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(c.cim)) h.push(`${id}: a cím tartalmazza a márkanevet — azt a lap sablonja teszi hozzá`)
  if (c.metaCim && new RegExp(t.nev, 'i').test(c.metaCim)) h.push(`${id}: a metaCim tartalmazza a márkanevet`)
  for (const m of c.markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const url = m[1]
    if (!url.startsWith('https://')) h.push(`${id}: kép-URL nem abszolút https: ${url}`)
    else if (!csaladi(url)) h.push(`${id}: kép nem családi domainen: ${url}`)
  }
  return h
}

/** Termék-szintű szabályok. */
export function ellenorizTermek(cikkek: Cikk[], t: Termek): string[] {
  const h: string[] = []
  const cimek = new Map<string, string>()
  for (const c of cikkek) {
    const k = (c.metaCim ?? c.cim).toLowerCase()
    if (cimek.has(k)) h.push(`${kulcs(c)}: azonos a címe a ${cimek.get(k)} cikkel`)
    cimek.set(k, kulcs(c))
  }
  if (cikkek.length >= 3) {
    const temak = new Set(cikkek.map((c) => c.tema))
    for (const tema of ['jogszabaly', 'gyakorlat', 'penzugy'] as const) if (!temak.has(tema)) h.push(`${t.nev}: hiányzó téma: ${tema}`)
  }
  return h
}
```

- [ ] **Step 4: Futtasd, menjen át** — `npm test`

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: content guard rules ported from NextRaktár, product-switchable

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Az élő cikkekre futó őrző-teszt (ez bukja a buildet)

**Files:**
- Create: `tests/cikkek.test.ts`, `cikkek/.gitkeep`

- [ ] **Step 1: A teszt**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { gyujtCikkek, feloldKapcsolodo } from '../src/gyujtes.ts'
import { ellenorizCikk, ellenorizTermek } from '../src/szabalyok.ts'
import { TERMEKEK } from '../src/termekek.ts'

// EZ a teszt védi az éles tartalmat: a Dockerfile futtatja, bukás = nincs deploy.
const cikkek = existsSync('cikkek') ? gyujtCikkek('cikkek', TERMEKEK) : []

test('minden cikk fejléce érvényes és a kapcsolódó hivatkozások feloldhatók', () => {
  if (cikkek.length === 0) return
  feloldKapcsolodo(cikkek)
})

test('egyetlen cikk sem sérti az őrző-szabályokat', () => {
  const hibak = cikkek.flatMap((c) => ellenorizCikk(c, TERMEKEK[c.termek]))
  assert.deepEqual(hibak, [])
})

test('termék-szintű szabályok', () => {
  const hibak = Object.entries(TERMEKEK).flatMap(([k, t]) => ellenorizTermek(cikkek.filter((c) => c.termek === k), t))
  assert.deepEqual(hibak, [])
})
```

- [ ] **Step 2: Futtasd** — `npm test` → zöld (a `cikkek/` még üres).

- [ ] **Step 3: Commit**

```bash
mkdir -p cikkek && touch cikkek/.gitkeep
git add -A && git commit -m "test: guard test over the live articles (fails the build on violation)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Markdown → HTML renderelés

**Files:**
- Create: `src/render.ts`
- Test: `tests/render.test.ts`

**Interfaces:**
- Consumes: `Cikk`.
- Produces: `renderelCikk(c: Cikk): { html: string; tartalomjegyzek: { id: string; cim: string }[] }`.

- [ ] **Step 1: Bukó teszt**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderelCikk } from '../src/render.ts'
import { olvasCikk } from '../src/cikk.ts'
import { TERMEKEK } from '../src/termekek.ts'

const c = olvasCikk('tests/fixtures/cikkek/nextbill/minta.md', TERMEKEK)
const { html, tartalomjegyzek } = renderelCikk(c)

test('h2 azonosítót kap, és a tartalomjegyzék ezekből áll', () => {
  assert.match(html, /<h2 id="elso-szakasz">Első szakasz<\/h2>/)
  assert.deepEqual(tartalomjegyzek, [{ id: 'elso-szakasz', cim: 'Első szakasz' }, { id: 'masodik-szakasz', cim: 'Második szakasz' }])
})
test('callout doboz a rögzített class-szal', () => {
  assert.match(html, /<div class="tudastar-callout"><p class="tudastar-callout-cim">Figyelem<\/p>\s*<p>Ez egy kiemelt doboz.<\/p>\s*<\/div>/)
})
test('kép: lazy, méret a címből, rögzített class, felirat', () => {
  assert.match(html, /<figure class="tudastar-kep"><img src="https:\/\/nextraktar.hu\/shots\/penztar-1600.webp" alt="Képfelirat" loading="lazy" width="1600" height="900"><figcaption>Képfelirat<\/figcaption><\/figure>/)
})
test('link: családi domainre noopener, idegenre noopener noreferrer, mindig új lap', () => {
  const idegen = renderelCikk({ ...c, markdown: '[x](https://nav.gov.hu/) [y](https://nextraktar.hu/arak)' }).html
  assert.match(idegen, /<a href="https:\/\/nav.gov.hu\/" target="_blank" rel="noopener noreferrer">x<\/a>/)
  assert.match(idegen, /<a href="https:\/\/nextraktar.hu\/arak" target="_blank" rel="noopener">y<\/a>/)
})
test('nyers HTML nem jut át — escape-elve jelenik meg', () => {
  assert.ok(!html.includes('<script>'), 'script tag átjutott')
  assert.ok(html.includes('&lt;script&gt;'))
})
test('csak az engedett elemek szerepelnek', () => {
  const tagek = new Set([...html.matchAll(/<([a-z0-9]+)[\s>]/g)].map((m) => m[1]))
  const engedett = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'code', 'pre', 'div', 'figure', 'figcaption'])
  for (const t of tagek) assert.ok(engedett.has(t), `nem engedett elem: ${t}`)
})
test('h1 a törzsben h2-vé szelídül (a cím a fejlécben van)', () => {
  assert.match(renderelCikk({ ...c, markdown: '# Ne legyen h1' }).html, /<h2 id="ne-legyen-h1">/)
})
```

- [ ] **Step 2: Futtasd, bukjon** — `npm test`

- [ ] **Step 3: `src/render.ts`**

```ts
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import { CSALADI_DOMAINEK } from './szabalyok.ts'
import type { Cikk } from './tipusok.ts'

/** Ékezetes magyar címből URL-barát azonosító. */
export function slugosit(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csaladi(url: string): boolean {
  try { const h = new URL(url).hostname; return CSALADI_DOMAINEK.some((d) => h === d || h.endsWith(`.${d}`)) } catch { return false }
}

function ujMd() {
  // html:false — nyers HTML escape-elve jelenik meg, ez A sanitizálás.
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false })

  // :::callout Cím … :::
  md.use(container, 'callout', {
    render(tokens: any[], idx: number) {
      const t = tokens[idx]
      if (t.nesting === 1) {
        const cim = md.utils.escapeHtml(t.info.trim().replace(/^callout\s*/, ''))
        return `<div class="tudastar-callout">${cim ? `<p class="tudastar-callout-cim">${cim}</p>\n` : ''}`
      }
      return '</div>\n'
    },
  })

  // Címsorok: h1 → h2 (a cím a fejlécben), h2/h3 id-t kap.
  md.core.ruler.push('tudastar_headings', (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const t = state.tokens[i]
      if (t.type !== 'heading_open') continue
      if (t.tag === 'h1') { t.tag = 'h2'; state.tokens[i + 2].tag = 'h2' }
      if (t.tag === 'h2' || t.tag === 'h3') t.attrSet('id', slugosit(state.tokens[i + 1].content))
    }
  })

  // Linkek: új lap; családi domainre noopener, idegenre noopener noreferrer.
  md.renderer.rules.link_open = (tokens, idx, opts, _env, self) => {
    const href = tokens[idx].attrGet('href') ?? ''
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', csaladi(href) ? 'noopener' : 'noopener noreferrer')
    return self.renderToken(tokens, idx, opts)
  }

  // Képek: figure + lazy + méret a címből ("1600x900").
  md.renderer.rules.image = (tokens, idx) => {
    const t = tokens[idx]
    const src = md.utils.escapeHtml(t.attrGet('src') ?? '')
    const alt = md.utils.escapeHtml(t.content)
    const meret = (t.attrGet('title') ?? '').match(/^(\d+)x(\d+)$/)
    const wh = meret ? ` width="${meret[1]}" height="${meret[2]}"` : ''
    return `<figure class="tudastar-kep"><img src="${src}" alt="${alt}" loading="lazy"${wh}><figcaption>${alt}</figcaption></figure>`
  }
  // Egy bekezdés, ami csak egy képből áll, ne legyen <p><figure>.
  md.renderer.rules.paragraph_open = (tokens, idx, opts, _env, self) =>
    tokens[idx + 1]?.children?.length === 1 && tokens[idx + 1].children![0].type === 'image' ? '' : self.renderToken(tokens, idx, opts)
  md.renderer.rules.paragraph_close = (tokens, idx, opts, _env, self) =>
    tokens[idx - 1]?.children?.length === 1 && tokens[idx - 1].children![0].type === 'image' ? '\n' : self.renderToken(tokens, idx, opts)
  return md
}

const MD = ujMd()

export function renderelCikk(c: Cikk): { html: string; tartalomjegyzek: { id: string; cim: string }[] } {
  const tokens = MD.parse(c.markdown, {})
  const tartalomjegyzek: { id: string; cim: string }[] = []
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_open' && tokens[i].tag === 'h2') {
      const cim = tokens[i + 1].content
      tartalomjegyzek.push({ id: slugosit(cim), cim })
    }
  }
  return { html: MD.renderer.render(tokens, MD.options, {}).trim(), tartalomjegyzek }
}
```

Megjegyzés: a `heading_open` a `core.ruler`-ben módosul, ezért a `parse` utáni tokenekben már h2 az egykori h1 — a tartalomjegyzék ezt látja.

- [ ] **Step 4: Futtasd, menjen át** — `npm test`. Ha a `figure`-tesztben az `<img>` attribútum-sorrendje eltér, a tesztet igazítsd a tényleges (determinisztikus) kimenethez — a lényeg: `loading="lazy"`, `width`, `height`, `figcaption`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: markdown renderer — heading ids, callout, figure images, link rel, no raw HTML

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Build → `dist/`

**Files:**
- Create: `src/build.ts`, `src/kimenet.ts`
- Test: `tests/build.test.ts`

**Interfaces:**
- Consumes: `gyujtCikkek`, `feloldKapcsolodo`, `ellenorizCikk`, `ellenorizTermek`, `renderelCikk`, `olvasasiPerc`, `TERMEKEK`.
- Produces: `src/kimenet.ts` — típusok `IndexTetel`, `CikkJson`, `SitemapTetel`, `Health`; `epitTermek(termek, cikkek, terkep, termekek) → { index: IndexTetel[]; cikkek: CikkJson[]; sitemap: SitemapTetel[] }`; `src/build.ts` — `build(opts: { cikkek: string; dist: string; most?: string })` és CLI (`tsx src/build.ts`).

- [ ] **Step 1: `src/kimenet.ts`**

```ts
import type { Forras, Tema } from './tipusok.ts'

export interface IndexTetel {
  slug: string; cim: string; leiras: string; tema: Tema; megjelent: string; frissitve?: string; percek: number
  /** A cikk abszolút URL-je a termék domainjén. */
  url: string
}
export interface KapcsolodoTetel { termek: string; nev: string; slug: string; cim: string; url: string }
export interface CikkJson extends IndexTetel {
  metaCim: string
  bevezeto: string
  html: string
  tartalomjegyzek: { id: string; cim: string }[]
  forrasok?: Forras[]
  ellenorizve?: string
  kapcsolodo: KapcsolodoTetel[]
  /** A termék Organization @id-je — a BlogPosting.publisher ide mutat. */
  orgId: string
}
export interface SitemapTetel { url: string; lastmod: string }
export interface Health { ok: true; cikkek: number; termekek: string[]; build: string }
```

- [ ] **Step 2: Bukó teszt**

`tests/build.test.ts`:
```ts
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
  assert.deepEqual(cikk.kapcsolodo.map((k: any) => k.url), ['https://nextbill.hu/tudastar/masik', 'https://nextraktar.hu/tudastar/harmadik'])
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
```

Fixture-ök: `tests/fixtures/cikkek-tiszta/` = a `cikkek/` fixture másolata a `rossz-fejlec.md` nélkül (a `frissitve`-t a `harmadik.md`-ben `2026-09-17`-re állítsd, hogy a sitemap `lastmod` tesztelhető legyen). `tests/fixtures/cikkek-rossz/nextbill/osszeg.md` = a `minta.md` másolata, benne egy „12 990 Ft" mondat, `slug: osszeg`, `kapcsolodo: [nextbill/masik, nextbill/minta]` + a `masik.md`, `minta.md` másolata (hogy a hivatkozás feloldódjon).

- [ ] **Step 3: Futtasd, bukjon** — `npm test`

- [ ] **Step 4: `src/build.ts`**

```ts
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { olvasasiPerc } from './cikk.ts'
import { gyujtCikkek, feloldKapcsolodo, kulcs } from './gyujtes.ts'
import { renderelCikk } from './render.ts'
import { ellenorizCikk, ellenorizTermek } from './szabalyok.ts'
import { TERMEKEK } from './termekek.ts'
import type { Cikk, Termekek } from './tipusok.ts'
import type { CikkJson, Health, IndexTetel, SitemapTetel } from './kimenet.ts'

const cikkUrl = (t: Termekek, c: Pick<Cikk, 'termek' | 'slug'>) => `${t[c.termek].domain}/tudastar/${c.slug}`

export function epitTermek(termek: string, cikkek: Cikk[], terkep: Map<string, Cikk>, termekek: Termekek) {
  const sajat = cikkek.filter((c) => c.termek === termek)
  const index: IndexTetel[] = sajat.map((c) => ({
    slug: c.slug, cim: c.cim, leiras: c.leiras, tema: c.tema, megjelent: c.megjelent,
    ...(c.frissitve ? { frissitve: c.frissitve } : {}), percek: olvasasiPerc(c), url: cikkUrl(termekek, c),
  }))
  const teljes: CikkJson[] = sajat.map((c, i) => {
    const { html, tartalomjegyzek } = renderelCikk(c)
    return {
      ...index[i], metaCim: c.metaCim ?? c.cim, bevezeto: c.bevezeto, html, tartalomjegyzek,
      ...(c.forrasok ? { forrasok: c.forrasok } : {}), ...(c.ellenorizve ? { ellenorizve: c.ellenorizve } : {}),
      kapcsolodo: c.kapcsolodo.map((k) => {
        const m = terkep.get(k)!
        return { termek: m.termek, nev: termekek[m.termek].nev, slug: m.slug, cim: m.cim, url: cikkUrl(termekek, m) }
      }),
      orgId: termekek[termek].orgId,
    }
  })
  const sitemap: SitemapTetel[] = sajat.map((c) => ({ url: cikkUrl(termekek, c), lastmod: c.frissitve ?? c.megjelent }))
  return { index, cikkek: teljes, sitemap }
}

/** A teljes build. Dob, ha bármi sérti a szabályokat — és akkor NEM ír ki semmit. */
export function build(opts: { cikkek: string; dist: string; most?: string; termekek?: Termekek }) {
  const termekek = opts.termekek ?? TERMEKEK
  const cikkek = gyujtCikkek(opts.cikkek, termekek)
  const terkep = feloldKapcsolodo(cikkek)
  const hibak = [
    ...cikkek.flatMap((c) => ellenorizCikk(c, termekek[c.termek])),
    ...Object.entries(termekek).flatMap(([k, t]) => ellenorizTermek(cikkek.filter((c) => c.termek === k), t)),
  ]
  if (hibak.length) throw new Error(`Őrző-szabálysértés:\n${hibak.join('\n')}`)

  rmSync(opts.dist, { recursive: true, force: true })
  const ir = (p: string, adat: unknown) => { mkdirSync(join(opts.dist, p, '..'), { recursive: true }); writeFileSync(join(opts.dist, p), JSON.stringify(adat)) }
  for (const termek of Object.keys(termekek)) {
    const e = epitTermek(termek, cikkek, terkep, termekek)
    ir(`v1/${termek}/index.json`, e.index)
    ir(`v1/${termek}/sitemap.json`, e.sitemap)
    for (const c of e.cikkek) ir(`v1/${termek}/${c.slug}.json`, c)
  }
  const health: Health = { ok: true, cikkek: cikkek.length, termekek: Object.keys(termekek), build: opts.most ?? new Date().toISOString() }
  ir('v1/health.json', health)
  mkdirSync(opts.dist, { recursive: true })
  writeFileSync(join(opts.dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  console.log(`tudástár build: ${cikkek.length} cikk, ${Object.keys(termekek).length} termék → ${opts.dist}`)
  return { cikkek: cikkek.map(kulcs) }
}

// CLI: `tsx src/build.ts`
if (process.argv[1] && /build\.ts$/.test(process.argv[1])) {
  build({ cikkek: 'cikkek', dist: 'dist' })
}
```

- [ ] **Step 5: Futtasd, menjen át** — `npm test`; majd `npx tsx src/build.ts` (üres `cikkek/` → 6 üres index, health `cikkek: 0`).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build dist/ — per-product index, article, sitemap JSON and health; fails on rule violation

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: A szolgáltatás (függőség nélküli HTTP-szerver)

**Files:**
- Create: `src/server.ts`
- Test: `tests/server.test.ts`

**Interfaces:**
- Produces: `inditSzerver(opts: { dist: string; port: number }): Promise<{ close(): Promise<void>; port: number }>`; CLI `node build/server.js` (`PORT`, `DIST` env).

- [ ] **Step 1: Bukó teszt**

```ts
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
  assert.equal((await fetch(`${base}/../package.json`)).status, 404)
  assert.equal((await fetch(`${base}/v1/../../package.json`)).status, 404)
})
test('csak GET és HEAD', async () => {
  assert.equal((await fetch(`${base}/v1/health`, { method: 'POST' })).status, 405)
  const h = await fetch(`${base}/v1/health`, { method: 'HEAD' })
  assert.equal(h.status, 200); assert.equal(await h.text(), '')
})
```

- [ ] **Step 2: Futtasd, bukjon** — `npm test`

- [ ] **Step 3: `src/server.ts`** — csak `node:` modulok (a runtime image-ben nincs `node_modules`)

```ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, normalize, resolve, sep } from 'node:path'

// A tudástár kiszolgálója. Csak a build által előállított `dist/`-et adja ki;
// nincs állapot, nincs függőség. A `/v1/health` a `v1/health.json`-ra képződik.

const TIPUSOK: Record<string, string> = { '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' }

function utvonal(dist: string, url: string): string | null {
  let p = decodeURIComponent(new URL(url, 'http://x').pathname)
  if (p === '/v1/health') p = '/v1/health.json'
  const teljes = resolve(dist, `.${normalize(p)}`)
  const gyoker = resolve(dist)
  if (teljes !== gyoker && !teljes.startsWith(gyoker + sep)) return null // kilépés a dist-ből
  return teljes
}

export function kezel(dist: string) {
  return (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end() }
    const f = utvonal(dist, req.url ?? '/')
    const kit = f?.match(/\.[a-z]+$/)?.[0] ?? ''
    let adat: Buffer
    try { if (!f || !statSync(f).isFile()) throw new Error('nincs'); adat = readFileSync(f) }
    catch { res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }); return res.end('{"hiba":"nincs ilyen"}') }
    const etag = `"${createHash('sha1').update(adat).digest('hex').slice(0, 16)}"`
    const fej = { 'Content-Type': TIPUSOK[kit] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=300', ETag: etag, 'Access-Control-Allow-Origin': '*', 'Content-Length': adat.length }
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': fej['Cache-Control'] }); return res.end() }
    res.writeHead(200, fej)
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
```

- [ ] **Step 4: Futtasd, menjen át** — `npm test`; majd `npm run build && (PORT=3999 node build/server.js & sleep 1; curl -si localhost:3999/v1/health; kill %1)` → 200, `{"ok":true,…}`.

  ⚠ A `tsc -p tsconfig.server.json` a `server.ts`-t `build/server.js`-be fordítja; a `.ts` importok NINCSENEK a szerverben (csak `node:`), ezért fordul önállóan.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: dependency-free static server for dist/ with ETag, cache and CORS headers

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: NextRaktár-import (22 cikk)

**Files:**
- Create: `scripts/import-nextraktar.ts`, `cikkek/nextraktar/*.md` (22 fájl, generált)
- Modify: `tests/cikkek.test.ts` (nincs változás, de most már 22 cikkre fut)

**Interfaces:**
- Consumes: a NextRaktár `origin/main` `site/src/lib/knowledge.ts` + `shots.ts` (`ARTICLES: Article[]`, `SHOTS: Record<ProductShotId, {base, w, h, widths}>`).

- [ ] **Step 1: A forrás kimásolása az `origin/main`-ről (a fő checkout piszkos)**

```bash
cd /home/kincsemgodlinux/gitrepos/nextraktar-web && git fetch -q origin
mkdir -p /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/nr
git show origin/main:site/src/lib/knowledge.ts > /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/nr/knowledge.ts
git show origin/main:site/src/lib/shots.ts     > /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/nr/shots.ts
```

A `knowledge.ts` `import type { ProductShotId } from './shots'` — típus-import, a `tsx` kezeli.

- [ ] **Step 2: `scripts/import-nextraktar.ts`**

```ts
// Egyszeri import: a NextRaktár kódban tartott ARTICLES tömbje → cikkek/nextraktar/*.md
// Futtatás: tsx scripts/import-nextraktar.ts <mappa, ahol a knowledge.ts és a shots.ts áll>
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const forras = resolve(process.argv[2] ?? '.')
const { ARTICLES } = await import(pathToFileURL(resolve(forras, 'knowledge.ts')).href)
const { SHOTS } = await import(pathToFileURL(resolve(forras, 'shots.ts')).href)

type Block = { type: 'p'; text: string } | { type: 'h2'; text: string } | { type: 'ul'; items: string[] } | { type: 'callout'; title: string; text: string } | { type: 'shot'; shot: string; caption?: string }

const y = (s: string) => JSON.stringify(s) // YAML-kompatibilis, idézőjeles string

function blokk(b: Block): string {
  switch (b.type) {
    case 'p': return b.text
    case 'h2': return `## ${b.text}`
    case 'ul': return b.items.map((i) => `- ${i}`).join('\n')
    case 'callout': return `:::callout ${b.title}\n${b.text}\n:::`
    case 'shot': {
      const s = SHOTS[b.shot]
      const w = s.widths[s.widths.length - 1]
      return `![${b.caption ?? s.alt}](https://nextraktar.hu${s.base}-${w}.webp "${s.w}x${s.h}")`
    }
  }
}

// Kapcsolódó: a NextRaktár cikkeknek nem volt — azonos témájú, sorrendben következő kettő
// (körkörösen). Determinisztikus, a szerkesztő később átírhatja.
function kapcsolodo(i: number): string[] {
  const azonos = ARTICLES.map((a: any, j: number) => ({ a, j })).filter(({ a }: any) => a.topic === ARTICLES[i].topic && a.slug !== ARTICLES[i].slug)
  const lista = azonos.length >= 2 ? azonos : ARTICLES.map((a: any, j: number) => ({ a, j })).filter(({ j }: any) => j !== i)
  const kezd = lista.findIndex(({ j }: any) => j > i)
  const sor = kezd === -1 ? lista : [...lista.slice(kezd), ...lista.slice(0, kezd)]
  return sor.slice(0, 2).map(({ a }: any) => `nextraktar/${a.slug}`)
}

mkdirSync('cikkek/nextraktar', { recursive: true })
ARTICLES.forEach((a: any, i: number) => {
  const fej = [
    `termek: nextraktar`, `slug: ${a.slug}`, `cim: ${y(a.title)}`,
    ...(a.metaTitle !== a.title ? [`metaCim: ${y(a.metaTitle)}`] : []),
    `bevezeto: ${y(a.lead)}`, `leiras: ${y(a.metaDescription)}`, `tema: ${a.topic}`, `megjelent: ${a.published}`,
    ...(a.updated ? [`frissitve: ${a.updated}`] : []),
    ...(a.forrasok ? ['forrasok:', ...a.forrasok.map((f: any) => `  - { cim: ${y(f.cim)}, url: ${y(f.url)} }`)] : []),
    ...(a.ellenorizve ? [`ellenorizve: ${a.ellenorizve}`] : []),
    'kapcsolodo:', ...kapcsolodo(i).map((k) => `  - ${k}`),
  ]
  const torzs = a.body.map(blokk).join('\n\n')
  writeFileSync(`cikkek/nextraktar/${a.slug}.md`, `---\n${fej.join('\n')}\n---\n\n${torzs}\n`)
  console.log(`${a.slug} (${a.body.length} blokk)`)
})
```

- [ ] **Step 3: Futtasd az importot és az őrző-teszteket**

```bash
npx tsx scripts/import-nextraktar.ts /tmp/claude-1000/-home-kincsemgodlinux-deploysapp/a612ca37-9df5-4264-8ef3-9c7c4642c072/scratchpad/nr
ls cikkek/nextraktar | wc -l   # 22
npm test
```

Expected: 22 fájl; a `cikkek.test.ts` zöld. Ha egy szabály bukik (pl. `cim` < 10 karakter, vagy a `kapcsolodo` rossz), az a NextRaktár eredeti adatában is így volt — nézd meg, és ha az import hibája, a scriptet javítsd, NE a cikket kézzel. Ha az eredeti tartalom sérti (nem várható, az eredeti tesztek ugyanezt őrizték), jegyezd fel és kérdezz.

- [ ] **Step 4: Build + tartalmi összevetés**

```bash
npx tsx src/build.ts
node -e "const i=require('./dist/v1/nextraktar/index.json'); console.log(i.length, i.map(x=>x.slug).join(' '))"
node -e "const c=require('./dist/v1/nextraktar/betetdij-a-kasszaban.json'); console.log(c.html.slice(0,400)); console.log(c.kapcsolodo)"
```

Expected: 22 tétel; a HTML-ben `<h2 id=…>`, `figure` a shot helyén, a kapcsolódók abszolút `https://nextraktar.hu/tudastar/…` URL-lel.

- [ ] **Step 5: Commit** (a script is marad — dokumentálja, hogyan jött a tartalom)

```bash
git add -A && git commit -m "feat(content): import the 22 NextRaktár knowledge-base articles (slugs unchanged)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Dockerfile és helyi konténer-próba

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Dockerfile**

```dockerfile
# Build: tesztek + generálás. Ha bármelyik őrző-teszt bukik, nincs image.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm test && npm run build

# Futás: csak a dist és a függőség nélküli szerver.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DIST=/app/dist
COPY --from=build /app/dist ./dist
COPY --from=build /app/build/server.js ./server.js
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Helyi build + smoke** (a hoszton a `docker` elérhető)

```bash
docker build -t tudastar-local . 2>&1 | tail -3
docker run -d --rm -p 3998:3000 --name tudastar-local tudastar-local
sleep 2; curl -s localhost:3998/v1/health; echo; curl -s localhost:3998/v1/nextraktar/index.json | head -c 200; echo
curl -s -o /dev/null -w "%{http_code}\n" localhost:3998/v1/nextbill/nincs.json
docker rm -f tudastar-local
```

Expected: `{"ok":true,"cikkek":22,…}`, az index JSON, `404`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "build: multi-stage Dockerfile — tests and generation at build, static server at runtime

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: GitHub-repó + NextHub-service + élő ellenőrzés

**Files:** nincs kódváltozás (infra). Eszközök: `git`, GitHub token `~/.config/claude-bootstrap/github-token` (a repo-create-hez, a bootstrap skill mintája), MCP `deploysapp_create_project`, `deploysapp_create_service`, `deploysapp_list_builds`, `deploysapp_get_build_logs`.

- [ ] **Step 1: GitHub repó** (privát nem kell — a tartalom publikus)

```bash
TOKEN=$(cat ~/.config/claude-bootstrap/github-token)
curl -s -X POST https://api.github.com/user/repos -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  -d '{"name":"next-tudastar","description":"A Next-termékcsalád közös tudástára — tartalom + szolgáltatás","private":false,"has_wiki":false}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('ssh_url'))"
cd /home/kincsemgodlinux/gitrepos/next-tudastar && git remote add origin git@github.com:zsomborbiro/next-tudastar.git && git push -u origin main
```

- [ ] **Step 2: NextHub project + service** (MCP eszközökkel; a fiók: zsombor200007@gmail.com)

- `deploysapp_create_project` — név: `next-tudastar`.
- `deploysapp_create_service` — projekt: az előző id; név: `tudastar`; forrás: GitHub `zsomborbiro/next-tudastar`, ág `main`; `internalPort: 3000`; Dockerfile a gyökérben (a worker detektálja); instance: a legkisebb (`nano`, 256 MB elég egy statikus szervernek); autodeploy be.
- Várd meg a buildet: `deploysapp_list_builds` → `success`; ha `failed`, `deploysapp_get_build_logs`.

- [ ] **Step 3: Ellenőrzés a NextHub-aldomainen**

```bash
curl -s https://tudastar.nexthub.hu/v1/health   # vagy amit a service kapott — a get_service mondja meg
```

Expected: `{"ok":true,"cikkek":22,…}`.

- [ ] **Step 4: Cloudflare CNAME + custom domain**

```bash
TOKEN=$(cat ~/.config/claude-bootstrap/cloudflare-token)
ZONE=$(python3 -c "import json;print(json.load(open('$HOME/.config/claude-bootstrap/cloudflare-zones.json'))['next-soft.hu'])")
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/dns_records" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"tudastar","content":"edge.deploysapp.com","ttl":1,"proxied":false}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['success'], d.get('errors'))"
```

(DNS-only, mint az `id.next-soft.hu` — ez a család custom-domain mintája; a TLS-t a NextHub adja.) Majd MCP `deploysapp_add_domain` (service: `tudastar`, domain: `tudastar.next-soft.hu`) → `deploysapp_verify_domain`. Várj, míg `status: active`.

- [ ] **Step 5: Élő ellenőrzés a végleges címen**

```bash
curl -si https://tudastar.next-soft.hu/v1/health | sed -n '1p;/etag/Ip;/cache-control/Ip;$p'
curl -s https://tudastar.next-soft.hu/v1/nextraktar/sitemap.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), d[0])"
curl -s https://tudastar.next-soft.hu/robots.txt
```

Expected: 200 + ETag + `max-age=300`; 22 sitemap-tétel `https://nextraktar.hu/tudastar/…`; `Disallow: /`.

- [ ] **Step 6: Memória + globális CLAUDE.md pointer**

A globális `/home/kincsemgodlinux/CLAUDE.md` „Saját szolgáltatások" táblájába egy sor:
`| Tudástár / SEO-cikkek | **next-tudastar** — markdown cikkek + JSON-szolgáltatás, \`tudastar.next-soft.hu/v1/<termek>/…\` | \`~/gitrepos/next-tudastar/CLAUDE.md\` | cikk a \`cikkek/<termek>/\` alá, \`npm test\` zöld, push → él |`

Memória-fájl (`project_tudastar_service_live.md`): mi él, a JSON-séma helye, a 2. terv (NextRaktár átállás) következik.

- [ ] **Step 7: Commit (ha a CLAUDE.md a repóban változott) + jelentés**

---

## Önellenőrzés (a plan írójának)

- **Spec-lefedettség:** 2.1 → T1; 2.2 → T2; 2.3 (15 szabály) → T4+T5 (a „minden téma képviselve" T4 `ellenorizTermek`; a „kapcsolodo ≥2, létező, nem önmaga" T3); 2.4 → T9; 3.1 végpontok → T7+T8; 3.2 cache → T8; 3.3 deploy+domain → T10+T11. A spec 4–5. szakasza (oldalak, cikkírás) a 2–3. terv. A „GYIK-mondat" szabály szándékosan a NextRaktár-repóban marad (spec 4.4) — a 2. terv része.
- **Típus-konzisztencia:** `Cikk.kapcsolodo: string[]` (T2) ↔ `feloldKapcsolodo` (T3) ↔ `CikkJson.kapcsolodo: KapcsolodoTetel[]` (T7) — a név ugyanaz, a build alakítja át. `kulcs()` T3-ban definiált, T4/T7 használja. `CSALADI_DOMAINEK` T4-ben, T6 importálja. `inditSzerver` T8-ban, a teszt ugyanazt a nevet hívja.
- **Placeholder:** a fixture-szövegek („… további bekezdések …") kitöltése a végrehajtó feladata, a követelmény (≥600 szó, összeg/százalék nélkül) explicit.
