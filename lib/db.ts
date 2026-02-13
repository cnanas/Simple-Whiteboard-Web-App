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
