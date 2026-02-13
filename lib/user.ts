import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
}

/** Find user by email (for sign-in) */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, email, password_hash, name FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `;
  return (rows[0] as UserRow) ?? null;
}

/** Create user (for registration). Returns user id or throws. */
export async function createUser(
  email: string,
  password: string,
  name?: string | null
): Promise<string> {
  if (!sql) throw new Error("Database not configured");
  const trimmed = email.toLowerCase().trim();
  if (!trimmed || !password || password.length < 8) {
    throw new Error("Email and password (min 8 characters) required");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${id}, ${trimmed}, ${passwordHash}, ${name?.trim() || null})
  `;
  return id;
}

/** Verify password against stored hash */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
