import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { nanoid } from "nanoid";

/** POST /api/rooms — create a new collaborative room */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: { name?: string; widgets?: unknown[]; viewport?: object };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const roomId = nanoid(12);
  const name = body.name || "Untitled Board";
  const data = JSON.stringify({
    widgets: Array.isArray(body.widgets) ? body.widgets : [],
    viewport: body.viewport ?? { x: 0, y: 0, zoom: 1 },
  });

  try {
    await sql`
      INSERT INTO rooms (id, name, owner_id, data)
      VALUES (${roomId}, ${name}, ${session.user.id}, ${data}::jsonb)
    `;

    // Add owner as a member
    await sql`
      INSERT INTO room_members (room_id, user_id, role)
      VALUES (${roomId}, ${session.user.id}, 'owner')
    `;

    return NextResponse.json({ roomId, name });
  } catch (e) {
    console.error("Room create error:", e);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

/** GET /api/rooms — list rooms the user belongs to */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const rows = await sql`
      SELECT r.id, r.name, r.owner_id, r.created_at, r.updated_at, rm.role
      FROM rooms r
      JOIN room_members rm ON r.id = rm.room_id
      WHERE rm.user_id = ${session.user.id}
      ORDER BY r.updated_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ rooms: rows });
  } catch (e) {
    console.error("Room list error:", e);
    return NextResponse.json({ error: "Failed to list rooms" }, { status: 500 });
  }
}
