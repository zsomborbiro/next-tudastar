import MarkdownIt, { type PluginWithParams } from 'markdown-it'
import container from 'markdown-it-container'
import { CSALADI_DOMAINEK } from './szabalyok.ts'
import type { Cikk } from './tipusok.ts'

/** Ékezetes magyar címből URL-barát azonosító. */
export function slugosit(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csaladi(url: string): boolean {
  try {
    const h = new URL(url).hostname
    return CSALADI_DOMAINEK.some((d) => h === d || h.endsWith(`.${d}`))
  } catch {
    return false
  }
}

function csakKep(inline: { children?: { type: string }[] | null } | undefined): boolean {
  return inline?.children?.length === 1 && inline.children[0].type === 'image'
}

function ujMd() {
  // html:false — nyers HTML escape-elve jelenik meg, ez A sanitizálás.
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false })

  // :::callout Cím … :::
  // A @types/markdown-it-container régebbi markdown-it típusra épül — a plugin futásidőben rendben van.
  md.use(container as unknown as PluginWithParams, 'callout', {
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
      if (t.tag === 'h1') {
        t.tag = 'h2'
        state.tokens[i + 2].tag = 'h2'
      }
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
    csakKep(tokens[idx + 1]) ? '' : self.renderToken(tokens, idx, opts)
  md.renderer.rules.paragraph_close = (tokens, idx, opts, _env, self) =>
    csakKep(tokens[idx - 1]) ? '\n' : self.renderToken(tokens, idx, opts)
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
