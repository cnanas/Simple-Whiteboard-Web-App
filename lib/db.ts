import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : null;

export { sql };

/** Run once (e.g. first deploy or manually) to create the boards table */
export const initBoardTable = async () => {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{"widgets":[],"viewport":{"x":0,"y":0,"zoom":1}}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
};

/** Run once to create collaboration tables */
export const initCollaborationTables = async () => {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Untitled Board',
      owner_id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{"widgets":[],"viewport":{"x":0,"y":0,"zoom":1}}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS room_members (
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (room_id, user_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      created_by TEXT NOT NULL,
      permission TEXT NOT NULL DEFAULT 'edit',
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
};
