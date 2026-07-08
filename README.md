# AWS Application — Profiles

Single Next.js project (App Router, TypeScript). UI + API in one app.
Sequelize ORM (MySQL / AWS RDS), sequelize-cli migrations, S3 image upload.

## Setup

1. Install deps:
   ```
   npm install
   ```
2. Copy env and fill real values:
   ```
   cp .env.example .env
   ```
   - `DB_*` → your AWS RDS MySQL endpoint/creds
   - `AWS_*` + `S3_BUCKET` → IAM keys with S3 put/delete on the bucket
3. Create the DB schema (runs migrations against the DB in `.env`):
   ```
   npm run migrate
   ```
4. Run:
   ```
   npm run dev
   ```
   Open http://localhost:3000

## Migrations

| command | does |
|---------|------|
| `npm run migrate` | apply pending migrations |
| `npm run migrate:undo` | roll back the last migration |
| `npm run migration:generate -- --name add_something` | scaffold a new migration |

Models (`src/models/`) are code-first for runtime; migrations (`migrations/`) own
the actual schema. When you change a model, write a matching migration.

## S3 notes

- Image POSTs go through `/api/upload` → S3, returns a public URL stored on the profile.
- Assumes the bucket serves objects publicly (or via CloudFront). For a private
  bucket, switch `src/lib/s3.ts` to return a presigned GET URL.

## Structure

```
config/config.js        sequelize-cli DB config (reads .env)
migrations/             SQL schema migrations
src/lib/db.ts           Sequelize singleton
src/lib/s3.ts           S3 upload/delete helpers
src/models/profile.ts   Profile model
src/app/api/            profiles CRUD + upload routes
src/app/page.tsx        UI
```
