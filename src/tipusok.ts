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
