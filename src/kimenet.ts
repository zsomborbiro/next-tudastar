import type { Forras, Tema } from './tipusok.ts'

// A szolgáltatás JSON-alakjai — EZ a szerződés a hat termék-oldal felé.
// Mezőnév-változás = a fogyasztók törése; csak bővíteni szabad.

export interface IndexTetel {
  slug: string
  cim: string
  leiras: string
  tema: Tema
  megjelent: string
  frissitve?: string
  /** Olvasási idő percben — számított. */
  percek: number
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
