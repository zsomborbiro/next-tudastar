// Egyszeri import: a NextRaktár kódban tartott ARTICLES tömbje → cikkek/nextraktar/*.md
// Futtatás: tsx scripts/import-nextraktar.ts <mappa, ahol a knowledge.ts és a shots.ts áll>
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const forras = resolve(process.argv[2] ?? '.')
const { ARTICLES } = await import(pathToFileURL(resolve(forras, 'knowledge.ts')).href)
const { SHOTS } = await import(pathToFileURL(resolve(forras, 'shots.ts')).href)

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'callout'; title: string; text: string }
  | { type: 'shot'; shot: string; caption?: string }

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
  const mind = ARTICLES.map((a: any, j: number) => ({ a, j }))
  const azonos = mind.filter(({ a, j }: any) => a.topic === ARTICLES[i].topic && j !== i)
  const lista = azonos.length >= 2 ? azonos : mind.filter(({ j }: any) => j !== i)
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
