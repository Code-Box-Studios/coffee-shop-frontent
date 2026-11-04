import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { config as loadEnvironment } from 'dotenv'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Media, MenuItems, Users } from './cms/collections'
import { Homepage, SiteSettings } from './cms/globals'

loadEnvironment({ quiet: true })
const directory = path.dirname(fileURLToPath(import.meta.url))
const secret = process.env.PAYLOAD_SECRET
const databaseURL = process.env.DATABASE_URL || 'file:./data/ember.db'
const usePostgres = /^postgres(?:ql)?:\/\//.test(databaseURL)
if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
  throw new Error('Set PAYLOAD_SECRET to a random value of at least 32 characters in .env.')
}
if (process.env.VERCEL && (!usePostgres || !process.env.BLOB_READ_WRITE_TOKEN)) {
  throw new Error('Vercel requires a Postgres DATABASE_URL and BLOB_READ_WRITE_TOKEN.')
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
  db: usePostgres
    ? postgresAdapter({
        pool: {
          connectionString: databaseURL,
          max: 5,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 15000,
        },
        push: false,
        disableCreateDatabase: true,
        migrationDir: path.resolve(directory, 'migrations/postgres'),
      })
    : sqliteAdapter({
        client: { url: databaseURL },
        push: process.env.NODE_ENV !== 'production',
        migrationDir: path.resolve(directory, 'migrations'),
        busyTimeout: 5000,
        wal: true,
      }),
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      alwaysInsertFields: true,
      clientUploads: true,
      // Payload reserves unique filenames before constructing media response URLs.
      addRandomSuffix: false,
    }),
  ],
  sharp,
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(directory, 'payload-types.ts') },
})
