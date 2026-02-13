-- Run this in your Neon (or Postgres) SQL console once.
-- Vercel: Storage → your Postgres → SQL Editor. Neon: Dashboard → SQL Editor.

-- Users for email/password sign-in (id is used as user_id in boards)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boards (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{"widgets":[],"viewport":{"x":0,"y":0,"zoom":1}}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
