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
  assert.ok(!html.includes('<p><figure'), 'a figure bekezdésbe került')
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
  const r = renderelCikk({ ...c, markdown: '# Ne legyen h1' })
  assert.match(r.html, /<h2 id="ne-legyen-h1">/)
  assert.deepEqual(r.tartalomjegyzek, [{ id: 'ne-legyen-h1', cim: 'Ne legyen h1' }])
})
