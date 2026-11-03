import { getPayload } from 'payload'
import config from '../payload.config'
import { seedContent } from './seed-content'

const payload = await getPayload({ config })
try {
  await seedContent(payload)
  payload.logger.info(
    'Sample content is ready. Existing edits were preserved. Create your administrator at /admin.',
  )
} finally {
  await payload.destroy()
}
