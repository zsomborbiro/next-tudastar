# next-tudastar — a Next-család közös tudástára

Spec: `docs/superpowers/specs/2026-09-17-tudastar-design.md`. Terv: `docs/superpowers/plans/`.

- Cikkek: `cikkek/<termek>/<slug>.md`, YAML-fejléccel (mezők: `src/cikk.ts`). Egy cikk = egy fájl.
- `npm test` = őrző-tesztek MINDEN cikkre — bukó teszt = nincs deploy (a Dockerfile futtatja).
- `npm run build` → `dist/v1/<termek>/{index,sitemap,<slug>}.json` + `build/server.js`.
- Élő: `https://tudastar.next-soft.hu/v1/<termek>/index.json`. Fogyasztók: a hat termék-oldal `/tudastar` útvonala.
- Új cikk: ág → cikk → `npm test` zöld → PR → merge → a NextHub 1 percen belül deployol, az oldalak ≤1 óra (ISR).
- Commit angolul; kód-komment, tesztnév magyarul.
