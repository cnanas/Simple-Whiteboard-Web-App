# Neon Postgres setup

The app uses **one** env var: **`DATABASE_URL`**. Use the **pooled** URL (recommended for serverless):

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

(Your Neon dashboard shows this as “Connection string” or “Pooled connection”.)

---

## 1. Set the env var

- **Local:** Put `DATABASE_URL=...` in `.env.local` (do not commit this file).
- **Vercel:** Project → Settings → Environment Variables → add `DATABASE_URL` with the same value.

You only need `DATABASE_URL`. The other Neon vars (e.g. `POSTGRES_URL`, `PGHOST`) are optional for this app.

---

## 2. Create the tables (one-time)

In the **Neon dashboard**: open your project → **SQL Editor** → New query. Paste and run:

```sql
-- Users for email/password sign-in
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boards (one per user)
CREATE TABLE IF NOT EXISTS boards (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{"widgets":[],"viewport":{"x":0,"y":0,"zoom":1}}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

(This is the same as `scripts/init-db.sql` in the repo.)

---

## 3. Run the app

- Local: `npm run dev` (with `.env.local` containing `DATABASE_URL`).
- Vercel: deploy; ensure `DATABASE_URL` is set in the project’s environment variables.

After that, sign-in (email/password, GitHub, Apple) and “Save to cloud” / “Load from cloud” will use Neon.
