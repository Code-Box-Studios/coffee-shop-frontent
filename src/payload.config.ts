import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { config as loadEnvironment } from 'dotenv'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Media, MenuItems, Users } from './cms/collections'
import { Homepage, SiteSettings } from './cms/globals'

loadEnvironment({ quiet: true })
const directory = path.dirname(fileURLToPath(import.meta.url))
const secret = process.env.PAYLOAD_SECRET
if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
  throw new Error('Set PAYLOAD_SECRET to a random value of at least 32 characters in .env.')
}

export default buildConfig({
  secret,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3341',
  admin: {
    user: 'users',
    importMap: {
      baseDir: directory,
      importMapFile: path.resolve(directory, 'app/(payload)/admin/importMap.ts'),
    },
    meta: { titleSuffix: ' | EMBER CMS' },
  },
  collections: [Users, Media, MenuItems],
  globals: [Homepage, SiteSettings],
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./data/ember.db' },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(directory, 'migrations'),
    busyTimeout: 5000,
    wal: true,
  }),
  sharp,
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(directory, 'payload-types.ts') },
})
