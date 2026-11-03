import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeContent } from '../src/lib/content'

test('CMS copy replaces demo copy while blank fields retain readable defaults', () => {
  const result = normalizeContent({
    homepage: { hero: { firstWord: '  FRESH  ', secondWord: '  ' } },
    settings: { brandName: 'New Roast', address: '12 Coffee Lane' },
    menu: [],
  })
  assert.equal(result.hero.firstWord, 'FRESH')
  assert.equal(result.hero.secondWord, 'DOWN.')
  assert.equal(result.settings.brandName, 'New Roast')
  assert.equal(result.settings.address, '12 Coffee Lane')
  assert.deepEqual(result.menu, [])
})

test('unpublished items stay private and published menu changes retain order and prices', () => {
  const result = normalizeContent({
    menu: [
      { id: 1, status: 'draft', title: 'Secret blend', price: 50, order: 0 },
      {
        id: 2,
        status: 'published',
        title: 'Pour Over',
        emphasis: 'Reserve.',
        price: 215,
        order: 3,
      },
      { id: 3, status: 'published', title: 'Espresso', price: 95, order: 1 },
    ],
  })
  assert.deepEqual(
    result.menu.map(({ id, title, price }) => ({ id, title, price })),
    [
      { id: '3', title: 'Espresso', price: 95 },
      { id: '2', title: 'Pour Over', price: 215 },
    ],
  )
})

test('missing media and invalid legacy values cannot produce broken images or counters', () => {
  const result = normalizeContent({
    homepage: { roast: { temperature: Number.NaN, extractionTime: 500 } },
    menu: [{ id: 1, status: 'published', title: 'Test', price: -10, image: 9 }],
  })
  assert.equal(result.roast.temperature, 93)
  assert.equal(result.roast.extractionTime, 120)
  assert.equal(result.menu[0].price, 0)
  assert.match(result.menu[0].image.src, /^\/images\//)
  assert.ok(result.menu[0].image.alt.length > 0)
})

test('populated Payload uploads replace the sample photos and carry accessible descriptions', () => {
  const result = normalizeContent({
    menu: [
      {
        id: 2,
        status: 'published',
        title: 'Mocha',
        price: 200,
        image: {
          url: '/api/media/file/mocha.webp',
          alt: 'A ceramic mocha cup',
          width: 1200,
          height: 900,
        },
      },
    ],
  })
  assert.deepEqual(result.menu[0].image, {
    src: '/api/media/file/mocha.webp',
    alt: 'A ceramic mocha cup',
    width: 1200,
    height: 900,
  })
})
