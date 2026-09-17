# next-tudastar

A Next-termékcsalád közös tudástára: markdown cikkek (`cikkek/<termek>/`) és a belőlük
buildelt JSON-szolgáltatás (`https://tudastar.next-soft.hu/v1/<termek>/…`).

- Új cikk: `cikkek/<termek>/<slug>.md` → `npm test` (őrző-szabályok) → push → NextHub deployol.
- Fejlesztés: `npm install && npm test && npm run build && npm start`.
- Részletek: `CLAUDE.md`, `docs/superpowers/specs/`.
