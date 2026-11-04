# Vercel and Neon Deployment Plan

**Goal:** Deploy the existing coffee website and Payload CMS to Vercel with durable data and uploads.

**Architecture:** Use Neon Postgres and Vercel Blob in production. Keep SQLite and local uploads for development. Separate migrations by database engine. Use a scoped database role for the running app and the owner role for migrations.

**Constraints:** Work on `main`; preserve `.env` and local data; keep secrets out of Git; retain existing content and access controls.

## Task 1: Hosting adapters

- [ ] Verify the current config rejects Postgres and the content mapper rejects Blob image URLs.
- [ ] Configure the Postgres adapter, bounded connection pool, and separate migration directory.
- [ ] Configure Blob storage and its client upload handler; permit its public image URLs.
- [ ] Run content tests, SQLite integration tests, and TypeScript checks.

## Task 2: Production resources and content

- [ ] Provision an isolated Neon database and Blob store in Singapore.
- [ ] Generate and apply the initial Postgres migration using the owner role.
- [ ] Preserve existing website content and create a private administrator credential file if needed.
- [ ] Configure production environment variables using a scoped runtime database role.

## Task 3: Deploy and verify

- [ ] Document deployment settings and migration commands.
- [ ] Verify the production build and commit changes on `main`.
- [ ] Deploy to the existing Vercel project.
- [ ] Verify the public website, administrator login, database writes, uploaded media, and browser rendering.
