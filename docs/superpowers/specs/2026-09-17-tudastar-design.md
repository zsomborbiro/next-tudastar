# Közös tudástár a Next-termékcsaládnak — tervezet

Dátum: 2026-09-17 · Állapot: jóváhagyásra vár

## 1. Cél és döntések

A Next-család hat publikus oldala (nexthub.hu, nextbill.hu, nextraktar.hu, nextceg.hu,
nextweblap.hu, next-soft.hu) egy közös tudástárból kap keresőre írt, örökzöld cikkeket,
amelyek **a termék saját domainjén** jelennek meg (`<domain>/tudastar/<slug>`). A cél a
termékoldalak organikus forgalmának növelése; a tartalom a családon belüli linkhálót is
erősíti (az 1. SEO-csomag entitás-gráfjára épül).

Jóváhagyott döntések (2026-09-17):

| Kérdés | Döntés | Miért |
|---|---|---|
| Hol élnek a cikkek? | **A termék domainjén** (`nextbill.hu/tudastar/…`), nem központilag | a domain kapja a keresőjelet, a látogató egy kattintásra a regisztrációtól |
| Útvonal | **`/tudastar`** mindenhol (nem `/blog`) | örökzöld tartalmat sugall, magyar, a NextRaktáron már él; a NextCég üres `/blog`-ja 301-et kap |
| Tartalom kezelése | **egy tartalom-repó** (`next-tudastar`), markdown | egy helyre írok, egy helyen nézed át; kereszthivatkozás triviális |
| Motor | **tartalom-szolgáltatás** a NextHubon, kész HTML+JSON-t ad; az oldalakon vékony réteg | nincs 6 másolat parserből; új cikk = egy push, a 6 oldalt nem kell redeployolni |
| Szolgáltatás hosztja | **`tudastar.next-soft.hu`** | a cég tudástára, nem a hosting-terméké; precedens: `id.next-soft.hu` |
| NextRaktár meglévő 22 cikke | **átköltözik** a tartalom-repóba, változatlan slugokkal | különben ott két forrás lenne |
| Cikkeket ki írja? | Claude generálja, a tulajdonos PR-ben hagyja jóvá | nincs admin-felület |

Nem része ennek a körnek: „X vs Y" versenytárs-összehasonlító lapok, szótár-oldalak,
FAQPage/BreadcrumbList mélyítés a nem-tudástár lapokon. Ezek a második kör.

## 2. Tartalom-repó: `next-tudastar`

```
cikkek/
  nextbill/<slug>.md
  nextraktar/<slug>.md        ← a 22 meglévő, scripttel konvertálva
  nexthub/<slug>.md
  nextceg/<slug>.md
  nextweblap/<slug>.md
  nextsoft/<slug>.md
termekek.json                  ← a hat termék adatai és szabály-kapcsolói
src/                           ← build + szolgáltatás (3. szakasz)
tests/                         ← őrző-tesztek (2.3)
docs/superpowers/specs/        ← ez a doksi
```

### 2.1 `termekek.json` (kivonat, két termékkel)

```json
{
  "nextbill": {
    "nev": "NextBill",
    "domain": "https://nextbill.hu",
    "orgId": "https://nextbill.hu/#organization",
    "szabalyok": { "nincsProbaido": false, "nincsKartyasFizetes": false }
  },
  "nextraktar": {
    "nev": "nextraktár",
    "domain": "https://nextraktar.hu",
    "orgId": "https://nextraktar.hu/#organization",
    "szabalyok": { "nincsProbaido": true, "nincsKartyasFizetes": true }
  }
}
```

Az `orgId` a termék `Organization` `@id`-je — ugyanaz, amit az 1. SEO-csomagban
minden oldal ír magáról; a `BlogPosting.publisher` erre mutat. A `szabalyok` a
termék-specifikus őrző-teszteket kapcsolják (2.3).

### 2.2 Cikk-formátum

Egy cikk = egy markdown fájl YAML-fejléccel. A fájlnév a slug.

```yaml
---
termek: nextbill
slug: nav-online-szamla-kotelezo
cim: "Kötelező-e a NAV Online Számla?"       # márkanév NÉLKÜL — a lap sablonja teszi hozzá
metaCim: "…"                                  # opcionális; ha nincs, a `cim`
bevezeto: "…"                                 # lead — a lap kiemelten, a törzs előtt mutatja
leiras: "…"                                   # meta description, 100–165 karakter
tema: jogszabaly | gyakorlat | penzugy
megjelent: 2026-09-20
frissitve: 2026-09-25                         # csak ÉRDEMI változásnál (sitemap lastmod, dateModified)
forrasok:                                     # jogszabályi cikknél kötelező, legalább egy
  - { cim: "NAV: Online Számla", url: "https://nav.gov.hu/…" }
ellenorizve: 2026-09-20                       # a `forrasok` párja; jogszabályi cikknél kötelező
kapcsolodo:                                   # legalább 2; termék/slug — testvér-termék is lehet
  - nextraktar/napi-zaras-a-boltban
  - nextbill/szamla-vagy-nyugta
---
```

Törzs: CommonMark + két saját elem.

- **Callout:** `:::callout Cím` … `:::` — figyelmeztető/kiemelt doboz.
- **Kép:** szabványos `![felirat](https://nextraktar.hu/shots/penztar-1600.webp)` —
  a kép a termék saját repójában, statikusan él; a tartalom-repó csak hivatkozza. A build
  ellenőrzi, hogy az URL abszolút és `https`.

Címsorok: csak `##` és `###` (a `#` a `cim`). A build minden `##`-nek `id`-t ad a
tartalomjegyzékhez.

### 2.3 Őrző-tesztek (a build része — bukó teszt = nincs deploy)

A NextRaktár `knowledge.test.ts` szabályai átvéve, termékenként kapcsolhatóan:

| Szabály | Hatály |
|---|---|
| frontmatter-séma teljes és típushelyes; `termek` létező; `slug` = fájlnév, egyedi terméken belül | minden |
| `cim` egyedi terméken belül, nem tartalmazza a márkanevet | minden |
| `leiras` 100–165 karakter (a meglévő NextRaktár-cikkek 130–159) | minden |
| legalább 600 szó (cím+bevezető+leírás+törzs) | minden |
| nincs beégetett Ft-összeg (`\d+\s*(Ft|forint)`) | minden |
| nincs paragrafus-hivatkozás (`\d+\.\s*§`) | `jogszabaly` |
| évszám csak `forrasok` + `ellenorizve` mellett | `jogszabaly` |
| `ellenorizve` nem korábbi a `megjelent`-nél, nem jövőbeli | ahol van |
| `forrasok` csak `https://`, címmel | ahol van |
| nincs kitalált statisztika („a boltok 73%-a…" minta) | minden |
| nem ígér próbaidőt | ahol `nincsProbaido: true` |
| nem ígér kártyás fizetést | ahol `nincsKartyasFizetes: true` |
| `kapcsolodo` legalább 2 elem, mind létező cikk, nem önmaga | minden |
| kép-URL abszolút `https`, a családi domainek egyikén | minden |
| minden téma képviselve terméken belül, ha ≥ 3 cikk van | termékenként |

Az olvasási idő **számított** (≈200 szó/perc, min. 1), nem tárolt mező.

### 2.4 A NextRaktár 22 cikkének átköltöztetése

Egyszeri script (`scripts/import-nextraktar.ts`): a `site/src/lib/knowledge.ts`
`ARTICLES` tömbjét markdownná írja — `p`→bekezdés, `h2`→`##`, `ul`→lista, `callout`→`:::callout`,
`shot`→kép a `shots.ts` alapján (`https://nextraktar.hu/<base>-<legnagyobb szélesség>.webp`).
Az `updated`→`frissitve`, `lead`→`bevezeto`, `forrasok`/`ellenorizve` egy az egyben; a `kapcsolodo`-t (ami ott nem volt) azonos témájú cikkekből tölti determinisztikusan. A slugok
változatlanok. Az import után a NextRaktár repóból a `knowledge.ts` + tesztje kikerül
(4.4).

## 3. Tartalom-szolgáltatás: `tudastar.next-soft.hu`

Ugyanez a repó NextHub-service-ként. **Build idején** (Dockerfile): őrző-tesztek →
markdown→HTML → statikus JSON fájlok a `dist/`-be. **Futásidőben** egy pár soros Node
HTTP-szerver csak a `dist/`-et szolgálja ki (cache- és CORS-fejléc kézben).

### 3.1 Végpontok

```
GET /v1/{termek}/index.json     [{ slug, cim, leiras, tema, megjelent, frissitve?, percek }]
GET /v1/{termek}/{slug}.json    { ...meta, html, tartalomjegyzek: [{id, cim}],
                                  forrasok?, ellenorizve?,
                                  kapcsolodo: [{ termek, nev, slug, cim, url }] }   ← url abszolút
GET /v1/{termek}/sitemap.json   [{ url, lastmod }]                                   ← url abszolút
GET /v1/health                  { ok: true, cikkek: <szám>, build: <ISO> }
GET /robots.txt                 Disallow: /
```

A `html` **sanitizált**: csak a build által előállított elemek (`p, h2, h3, ul, ol, li,
strong, em, a, img, blockquote, div.callout, code`); a `<a>` külső linkje `rel="noopener"`
(családi domainre `noreferrer` nélkül — l. 1. csomag), az `<img>` `loading="lazy"`, és `width/height`, ha a
markdown kép-címe (title) `"SZÉLESSÉGxMAGASSÁG"` alakú: `![felirat](url "1600x900")`.

### 3.2 Cache és hibatűrés

- `Cache-Control: public, max-age=300`, `ETag` a fájl hash-éből.
- Nincs adatbázis, nincs állapot. A repó a forrás.
- Ha a szolgáltatás nem elérhető, az oldalak ISR-je az utolsó jó változatot adja (4.2).

### 3.3 Deploy

GitHub `zsomborbiro/next-tudastar` → NextHub webhook → build → élő. Custom domain
`tudastar.next-soft.hu` (Cloudflare CNAME → `edge.deploysapp.com`, a NextHub HTTP-01
nélkül, a TLS a CF peremén — a meglévő custom-domain minta). A NextHub `nexthub.hu` aldomain
marad technikai tartalék.

## 4. Az oldalak vékony rétege (6 oldal)

### 4.1 Útvonalak

- `/tudastar` — lista, téma-szűrővel (query: `?tema=`), a saját `SiteHeader`/`SiteFooter` között.
- `/tudastar/[slug]` — cikk. Ismeretlen slug → `notFound()`.
- NextWeblap: `src/app/platform/tudastar/…` (a platform-hoszt rewrite alatt; boltok nem kapják).
- NextCég: `/blog` és `/blog/*` → 301 `/tudastar` (`next.config` redirect); a `BlogPost`
  modell és az admin-blog útvonalak kikerülnek (üres, sosem volt tartalom).

### 4.2 Adatlekérés

**Kivétel — NextRaktár (döntés 2026-09-18):** a NextRaktáron a cikkeket tíz hely olvassa
szinkron módon (sitemap, a kurált belső linkháló `related.ts`, öt teszt-család köztük
jogi-megfelelőségi őrökkel), és a `[slug]` lap szándékosan `dynamicParams=false`. Ott ezért
NEM futásidejű ISR, hanem **pillanatkép a buildben**: a Docker-build első lépése letölti a
`/v1/nextraktar/*.json`-t egy generált, gitignore-olt `src/lib/tudastar.generated.json`-ba, a
`lib/knowledge.ts` ebből adja a régi felületet (`ARTICLES`, `findArticle`, `articleText`…), így a
fogyasztók és az őrök változatlanul futnak. Elérhetetlen szolgáltatás = bukó build. Új cikk
után a NextRaktárt újra kell buildelni — ezt a tudástár-szolgáltatás automatizálja: induláskor
(csak friss image esetén) meghívja a `DEPLOY_HOOKS` env-ben felsorolt NextHub deploy-hookokat.
A többi öt oldalra az alábbi ISR-modell érvényes.


Next.js `fetch(…, { next: { revalidate: 3600 } })` → statikus lapok, óránként
újraérvényesítve. `generateStaticParams` az `index.json`-ból. **Build közben elérhetetlen
szolgáltatás = bukó build** (szándékos: ne deployoljunk üres tudástárral). Futásidőben az ISR
az utolsó jó változatot szolgálja ki, ha a szolgáltatás nem válaszol.

Egy közös `lib/tudastar.ts` (oldalanként másolat, a JSON-sémára írva): `listaTudastar()`,
`cikkTudastar(slug)`, `sitemapTudastar()`, a `TUDASTAR_URL` + `TUDASTAR_TERMEK`
env-ből (alapérték a kódban). 

### 4.3 Ami a lapon van

- lista: cím, lead, téma-címke, olvasási idő, dátum.
- cikk: `html` injektálva (`dangerouslySetInnerHTML` — a forrás a saját szolgáltatásunk, a
  build sanitizálta), tartalomjegyzék a `tartalomjegyzek`-ből, „Kapcsolódó" blokk (testvér-domainre
  is), „Források · ellenőrizve: <dátum>" sáv ha van, CTA a termék regisztrációjára.
- `metadata`: `title` = `cim` (a layout sablonja adja a márkát), `description` = `leiras`,
  canonical, OG.
- JSON-LD: `BlogPosting` (`headline`, `description`, `datePublished`, `dateModified`,
  `author`/`publisher` = `{ "@id": <orgId> }`, `mainEntityOfPage`, `inLanguage: hu-HU`) +
  `BreadcrumbList` (Főoldal → Tudástár → cikk).
- sitemap: a meglévő `sitemap.ts` kiegészül a `sitemap.json` tételeivel (`lastmod`).
- CSS: az oldal saját tokenjeivel; a HTML-blokkok class-nevei a szolgáltatás oldalán rögzítettek
  (`.tudastar-callout`, `.tudastar-kep`), a lap ezekre stílusoz.

### 4.4 Egységesítés

A hat oldal négy stackben él (JS/TS, Next 14/15, npm/pnpm) → nem közös csomag, hanem
**referencia-implementáció a NextRaktáron** (ami átáll a szolgáltatásra), és onnan átvitt,
a helyi konvenciókhoz igazított másolat. A JSON-séma és a class-nevek a szolgáltatásban
rögzítettek, ezért a másolatok a tartalmon nem tudnak szétdriftelni, csak a stíluson.

NextRaktár: a `lib/knowledge.ts` tartalma (4100 sor) kikerül, marad egy vékony betöltő a
generált pillanatképből (4.2 kivétel); a `knowledge.test.ts`-ből a tartalom-repóba átvitt
általános szabályok kikerülnek, a GYIK-őrök maradnak; a `tudastar/[slug]` lap a kész HTML-t
injektálja (`ArticleBody` blokk-renderelő helyett); a `shots.ts` és a képek maradnak (a
cikkek URL-lel hivatkozzák), a képernyőkép-nagyító a cikkekben megszűnik.
A `faq.ts` „nincs szó szerint átvett GYIK-válasz" szabálya a tartalom-repóba nem vihető
(nem ismeri a GYIK-et) — a NextRaktár repóban marad egy teszt, ami a szolgáltatásból
lekért cikkek szövegét veti össze a GYIK-kel (hálózat nélkül skip).

### 4.5 Sorrend

1. tartalom-repó + őrző-tesztek + NextRaktár-import + szolgáltatás → élő `tudastar.next-soft.hu`
2. NextRaktár átállás (referencia) — a 22 cikk URL-je változatlan, összevetés előtte/utána
3. NextBill, NextHub, NextCég, NextWeblap, NextSoft — egyenként, mindegyik 4 indító cikkel
4. Search Console: az új URL-ek beküldése (tulajdonos)

## 5. Cikkírás munkafolyamata

- Claude ír, termékenként egy ágon 3–5 cikket → őrző-tesztek zöld → PR → a tulajdonos átnézi
  (markdown, olvasható a GitHubon) → merge → ~1 perc múlva a szolgáltatásban, ≤1 óra múlva a lapokon.
- `jogszabaly` cikk csak elsődleges forrással (nav.gov.hu, magyarorszag.hu, njt.hu) és
  `ellenorizve` dátummal — ezeket a tulajdonos tudatosan hagyja jóvá. `gyakorlat` és `penzugy`
  forrás nélkül mehet, de összeg és statisztika ott sem.
- Egy cikk: egy konkrét keresésre válaszol (a cím a kérdés/feladat), 600–1200 szó, a termék
  csak ott, ahol tényleg megoldja a problémát, ≥2 `kapcsolodo`, ebből lehetőleg 1 testvér-termékre.

Indító témák (első kör, termékenként 4):

| Termék | Témák |
|---|---|
| NextBill | Kötelező-e a NAV Online Számla? · Számla vagy nyugta — mikor melyik · Devizás számla: MNB-árfolyam és a NAV · Ismétlődő számla: mit lehet automatizálni |
| NextHub | Mi az a Docker-hosting, és kinek való · Saját domain bekötése: DNS lépésről lépésre · Hogyan kerül egy GitHub-repo élesbe · Miért nem elég a shared hosting egy webalkalmazásnak |
| NextCég | Hogyan kérj árajánlatot, hogy összehasonlítható legyen · Mit ellenőrizz egy cégen, mielőtt megbízod · Céginformáció: mit jelentenek a mezők · Hogyan legyen megtalálható egy kisvállalkozás |
| NextWeblap | Webshop-indítás: mi kell hozzá jogilag · Saját domain vagy aldomain · Termékadat, ami elad (fotó, leírás, GTIN) · Kosárelhagyás: az első 3 javítás |
| NextSoft | Mennyibe kerül egy weboldal? · CRM egy kisvállalkozásnak: mikor éri meg · Kamerarendszer telepítése: a lépések · Weboldal vs webshop — melyiket, mikor |
| NextRaktár | a 22 meglévő; új cikk a második körben |

## 6. Tesztek és ellenőrzés

- Tartalom-repó: őrző-tesztek (2.3) + a build determinisztikus (ugyanaz a bemenet → ugyanaz a
  `dist/`), a HTML-sanitizálás tesztje (tiltott tag/attribútum nem jut át), a `kapcsolodo`
  URL-feloldás tesztje.
- Szolgáltatás: `health` + egy `index.json`/cikk/`sitemap.json` smoke a Dockerfile buildjében.
- Oldalak: a meglévő teszt-mintákkal — sitemap tartalmazza a tudástár-URL-eket, a
  `BlogPosting.publisher` `@id`-je egyezik az oldal `Organization` `@id`-jével, ismeretlen slug
  404, a `/blog` 301 (NextCég). Build mind a hat oldalon.
- Élő ellenőrzés a nyers HTML-ből (nem JS után): a cikk szövege, a JSON-LD és a canonical benne
  van — az 1. csomag nexthub.hu-s lelete miatt ez kötelező lépés.

## 7. Kockázatok

- **Szolgáltatás-függés:** hat oldal buildje függ egy szolgáltatástól. Enyhítés: ISR
  utolsó-jó-változat, `health` a NextHub crash-loop figyelőjében, és a szolgáltatás állapot
  nélküli — újraindítás mindig sikerül.
- **Jogszabályi állítás elavul:** a `forrasok` + `ellenorizve` a lapon látszik; évente
  átnézés a `jogszabaly` cikkeken (tulajdonos naptár).
- **Kannibalizáció:** két termék ugyanarra a keresésre ír. Enyhítés: a témalista termékenként
  eltérő szög; a `kapcsolodo` a másikra mutat, nem versenyez vele.
