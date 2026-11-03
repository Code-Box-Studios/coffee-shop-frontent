import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { getPayload, type Payload } from 'payload'

let payload: Payload
let directory: string

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'ember-cms-test-'))
  process.env.DATABASE_URL = `file:${path.join(directory, 'test.db')}`
  process.env.PAYLOAD_SECRET = 'isolated-test-secret-not-used-by-the-running-application'
  Object.assign(process.env, { NODE_ENV: 'test' })
  const { default: config } = await import('../src/payload.config')
  payload = await getPayload({ config })
})

after(async () => {
  await payload?.destroy()
  if (directory) await rm(directory, { recursive: true, force: true })
})

test('public visitors see published menu items but cannot read drafts', async () => {
  await payload.create({
    collection: 'menu-items',
    data: { slug: 'visible', title: 'Visible', price: 150, status: 'published' },
  })
  await payload.create({
    collection: 'menu-items',
    data: { slug: 'private', title: 'Private', price: 150, status: 'draft' },
  })
  const result = await payload.find({ collection: 'menu-items', overrideAccess: false })
  assert.deepEqual(
    result.docs.map((item) => item.slug),
    ['visible'],
  )
})

test('unauthenticated clients cannot create menu content or change globals', async () => {
  await assert.rejects(() =>
    payload.create({
      collection: 'menu-items',
      overrideAccess: false,
      data: { slug: 'unauthorized', title: 'Unauthorized', price: 1, status: 'draft' },
    }),
  )
  await assert.rejects(() =>
    payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: false,
      data: { hero: { firstWord: 'HACKED' } },
    }),
  )
  await assert.rejects(() => payload.find({ collection: 'users', overrideAccess: false }))
})

test('seeding twice preserves menu edits, homepage edits, and the number of records', async () => {
  const { seedContent } = await import('../src/cms/seed-content')
  await seedContent(payload, { uploadImages: false })
  const first = await payload.find({ collection: 'menu-items', limit: 100 })
  const house = first.docs.find((item) => item.slug === 'house-flat-white')
  assert.ok(house)
  await payload.update({ collection: 'menu-items', id: house.id, data: { price: 225 } })
  await payload.updateGlobal({ slug: 'homepage', data: { hero: { firstWord: 'EDITED' } } })
  await seedContent(payload, { uploadImages: false })
  const second = await payload.find({ collection: 'menu-items', limit: 100 })
  assert.equal(second.totalDocs, first.totalDocs)
  assert.equal(second.docs.find((item) => item.id === house.id)?.price, 225)
  assert.equal((await payload.findGlobal({ slug: 'homepage' })).hero?.firstWord, 'EDITED')
})
