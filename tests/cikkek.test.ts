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
