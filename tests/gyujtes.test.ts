import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gyujtCikkek, feloldKapcsolodo, kulcs } from '../src/gyujtes.ts'
import { TERMEKEK } from '../src/termekek.ts'

const KIHAGY = { kihagy: ['rossz-fejlec'] }

test('a fixture-mappa minden cikkét felveszi, termék és slug szerint rendezve', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, KIHAGY)
  assert.deepEqual(cikkek.map(kulcs), ['nextbill/masik', 'nextbill/minta', 'nextraktar/harmadik'])
})

test('a kapcsolódó hivatkozások feloldódnak', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, KIHAGY)
  const terkep = feloldKapcsolodo(cikkek)
  assert.equal(terkep.get('nextbill/minta')?.cim, 'Minta cikk a tesztekhez')
})

test('nem létező kapcsolódó cikk hibát dob, a hivatkozó nevével', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, KIHAGY)
  cikkek[0].kapcsolodo = ['nexthub/nincs-ilyen', 'nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /nextbill\/masik.*nexthub\/nincs-ilyen/)
})

test('önhivatkozás és kettőnél kevesebb kapcsolódó nem megy át', () => {
  const cikkek = gyujtCikkek('tests/fixtures/cikkek', TERMEKEK, KIHAGY)
  cikkek[0].kapcsolodo = ['nextbill/masik', 'nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /önmagára/)
  cikkek[0].kapcsolodo = ['nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /legalább 2/)
  cikkek[0].kapcsolodo = ['nextbill/minta', 'nextbill/minta']
  assert.throws(() => feloldKapcsolodo(cikkek), /ismétlődő/)
})

test('hibás fejlécű cikk a gyűjtést is megállítja', () => {
  assert.throws(() => gyujtCikkek('tests/fixtures/cikkek', TERMEKEK), /rossz-fejlec\.md: hibás fejléc/)
})
