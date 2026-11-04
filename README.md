# EMBER Coffee

A coffee shop website built with Next.js 16, strict TypeScript, Tailwind CSS 4, Payload CMS 3, Three.js, and GSAP ScrollTrigger.

The continuous scroll journey rotates a branded 3D cup, moves the camera through five chapters, scatters coffee beans, transitions through the latte surface, and reveals a horizontal menu. Mobile retains the same story. Reduced motion uses ordinary document flow, and browsers without WebGL retain the content and photographic fallback.

## Local setup

Use Node.js `^22.23.4 || >=24.22.1` and pnpm 12.

```bash
pnpm install
cp .env.example .env
```

Set `PAYLOAD_SECRET` in `.env` to a randomly generated value of at least 32 characters. For example, generate one with `openssl rand -hex 32`. Keep `.env` private. The other defaults use a local SQLite database and port 3341.

```bash
pnpm db:seed
pnpm dev
```

- Website: <http://localhost:3341>
- Administration: <http://localhost:3341/admin>

The admin page lets you create the first administrator. No administrator or default password is included in the seed. Subsequent accounts and content changes require authentication.

`pnpm db:seed` creates sample images, menu items, and global content. Rerunning it creates missing sample records and preserves existing edits. Development uses Payload's SQLite schema push. The database lives in `data/ember.db`; uploads live in `public/media/`. Both are ignored by Git and must persist across restarts.

## Editing the website

- **Homepage:** hero words, origin story, brewing copy and counters, pause chapter, menu heading, and café image.
- **Site settings:** branding, search title and description, currency, location, address, email, and opening hours.
- **Menu items:** titles, prices, descriptions, tasting notes, pictures, display order, and publication status. Draft items remain private.
- **Media:** upload JPEG, PNG, WebP, or AVIF images up to 10 MB and supply an accessible image description.

The website reads saved content on the server on each request. Reload the page after saving changes. An empty published menu shows an empty state rather than restoring demo items. Adding or removing items automatically adjusts the horizontal sequence.

The sample address and contact email are intentionally blank. Set real details in Site settings. Menu prices are seeded examples; no checkout or payment processing is included.

## Commands

```bash
pnpm test                # Content, scroll calculations, real SQLite access and seeding tests
pnpm typecheck           # Strict TypeScript
pnpm test:e2e            # Real browser journey, mobile, reduced motion, dialogs, admin, CMS update
pnpm format:check        # Formatting
pnpm build              # Production build
pnpm start              # Production server on port 3341
pnpm generate:types     # Regenerate Payload types after schema changes
pnpm generate:importmap # Regenerate the admin import map
```

Install Playwright's Chromium once with `pnpm exec playwright install chromium`. The browser suite starts the development server if one is not already running. `E2E_BASE_URL` can point to another running instance. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an existing Chromium binary.

CMS unit tests use a temporary database. The final browser test creates an ephemeral administrator, changes the hero through the authenticated API, verifies the rendered page, then restores the original hero and deletes the temporary account. Run browser tests against a development instance.

## Production database and hosting

Configure a production secret, `DATABASE_URL`, and `NEXT_PUBLIC_SERVER_URL`. For a **fresh production database**, apply the included initial migration before starting the app:

```bash
NODE_ENV=production pnpm db:migrate
pnpm build
pnpm start
```

Do not apply the initial migration to a development database already managed by schema push. Use a separate production database. Future production schema changes require generated and reviewed migrations (`pnpm payload migrate:create <name>`).

SQLite and uploaded media require persistent writable storage. This setup fits a Node server with a persistent disk. For deployments with ephemeral filesystems, configure an appropriate Payload database and storage adapter before deploying. `MEDIA_DIR` can override the local upload directory.

### Vercel with Neon and Blob

Postgres URLs (`postgres://` or `postgresql://`) select the Postgres adapter. File URLs retain SQLite for local development. The database engines have separate migration histories: `src/migrations/postgres/` and `src/migrations/` respectively. Postgres schema push is disabled in every environment; apply migrations before using a new database.

Configure these **production** environment variables in Vercel:

- `DATABASE_URL`: the pooled Neon connection URL for a scoped runtime role. Use `sslmode=verify-full` to require certificate verification.
- `PAYLOAD_SECRET`: a separate production secret of at least 32 random characters.
- `NEXT_PUBLIC_SERVER_URL`: the production HTTPS origin.
- `BLOB_READ_WRITE_TOKEN`: the public Vercel Blob store token. The Payload storage plugin disables local upload writes and enables authenticated client uploads for files larger than Vercel's request limit.

Run migrations separately with the database owner connection, before deployment. Keep this connection out of the deployed runtime environment. For example, with private owner credentials in `.env.neon`:

```bash
NODE_ENV=production pnpm exec tsx --env-file=.env.neon ./node_modules/payload/bin.js migrate
pnpm build
```

Grant the runtime role schema usage, table read/write access, and sequence usage; configure the owner's default privileges for future migrations. The runtime role does not need schema creation rights or membership in `neon_superuser`. Keep the Neon database and Vercel function region close together, such as Singapore (`aws-ap-southeast-1` and `sin1`).

Use a separate database and secret if preview deployments need a working CMS. Production variables are intentionally scoped to production. Vercel builds fail clearly when Postgres or Blob configuration is missing.

For the first deployment, keep Vercel authentication enabled until an administrator has been created and content imported. Then allow public production access while retaining preview protection. Administrator credentials and migration exports belong in ignored private files, never Git.

Outbound email is not configured. Password reset email delivery requires a Payload email adapter before production use. No email delivery is claimed by the local setup.

## Structure

```text
src/app/(frontend)/           Website, metadata, fonts, and visual styles
src/app/(payload)/            Payload administration and APIs
src/components/experience/    React markup, dialog, scroll controller, 3D renderer
src/cms/                     Access rules, collections, globals, and seed
src/lib/                     Typed frontend contract and CMS content mapping
src/migrations/              Production database migrations
tests/                       Unit, database, and browser coverage
public/images/               Bundled sample photographs
public/fonts/                Self-hosted fonts and their licenses
```

The renderer owns its GPU resources and animation loop. The scroll controller scopes selectors and GSAP cleanup to its React root. Async startup is cancelled on unmount to support development Strict Mode and navigation.

Development writes build artifacts to `.next-dev`; production uses `.next`. This keeps a production build from overwriting the running development server's manifests.

Image and font sources are listed in [ATTRIBUTION.md](./ATTRIBUTION.md).
