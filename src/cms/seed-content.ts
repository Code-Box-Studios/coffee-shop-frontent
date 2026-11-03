import path from 'node:path'
import type { Payload } from 'payload'
import { defaultContent } from '../lib/default-content'

/** Create only missing sample records. Existing CMS edits are never replaced. */
export async function seedContent(
  payload: Payload,
  options: { uploadImages?: boolean } = {},
): Promise<void> {
  const media = new Map<string, number>()
  if (options.uploadImages !== false) {
    for (const image of [
      ...defaultContent.menu.map((item) => item.image),
      defaultContent.visit.image,
    ]) {
      const sourceKey = `ember-sample-${path.basename(image.src)}`
      const existing = await payload.find({
        collection: 'media',
        where: { sourceKey: { equals: sourceKey } },
        limit: 1,
      })
      const item =
        existing.docs[0] ||
        (await payload.create({
          collection: 'media',
          data: { alt: image.alt, sourceKey },
          filePath: path.resolve(process.cwd(), 'public', image.src.slice(1)),
        }))
      media.set(image.src, item.id)
    }
  }
  const homepage = await payload.findGlobal({ slug: 'homepage' })
  if (!homepage.updatedAt) {
    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        hero: defaultContent.hero,
        origin: defaultContent.origin,
        roast: defaultContent.roast,
        pause: defaultContent.pause,
        menuHeading: defaultContent.menuHeading,
        visit: { ...defaultContent.visit, image: media.get(defaultContent.visit.image.src) },
      },
    })
  }
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  if (!settings.updatedAt)
    await payload.updateGlobal({ slug: 'site-settings', data: defaultContent.settings })
  for (const [order, item] of defaultContent.menu.entries()) {
    const existing = await payload.find({
      collection: 'menu-items',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })
    if (existing.totalDocs) continue
    await payload.create({
      collection: 'menu-items',
      data: {
        slug: item.slug,
        title: item.title,
        emphasis: item.emphasis,
        eyebrow: item.eyebrow,
        description: item.description,
        details: item.details,
        price: item.price,
        imageCaption: item.imageCaption,
        actionLabel: item.actionLabel,
        image: media.get(item.image.src),
        flavorNotes: item.flavorNotes.map((note) => ({ note })),
        order,
        status: 'published',
      },
    })
  }
}
