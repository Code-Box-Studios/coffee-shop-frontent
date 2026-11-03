import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { normalizeContent } from './content'

export const getExperienceContent = cache(async () => {
  const payload = await getPayload({ config })
  const [homepage, settings, menu] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', depth: 1, overrideAccess: false }),
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    payload.find({
      collection: 'menu-items',
      depth: 1,
      sort: 'order',
      limit: 100,
      overrideAccess: false,
    }),
  ])
  return normalizeContent({ homepage, settings, menu: menu.docs })
})
