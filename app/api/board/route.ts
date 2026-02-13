import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export type BoardPayload = {
  widgets: unknown[];
  viewport: { x: number; y: number; zoom: number };
};

/** GET /api/board — load current user's board from cloud */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const rows = await sql`
      SELECT data FROM boards WHERE user_id = ${session.user.id} LIMIT 1
    `;
    const row = rows[0];
    if (!row || !row.data) {
      return NextResponse.json({ data: null });
    }
    const data = row.data as BoardPayload;
    return NextResponse.json({ data: { widgets: data.widgets ?? [], viewport: data.viewport ?? { x: 0, y: 0, zoom: 1 } } });
  } catch (e) {
    console.error("Board GET error:", e);
    return NextResponse.json(
      { error: "Failed to load board" },
      { status: 500 }
    );
  }
}

/** POST /api/board — save current user's board to cloud */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  let body: BoardPayload;
  try {
    body = await request.json();
    if (!body || typeof body.widgets !== "object" || typeof body.viewport !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO boards (user_id, data, updated_at)
      VALUES (${session.user.id}, ${JSON.stringify({ widgets: body.widgets, viewport: body.viewport })}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Board POST error:", e);
    return NextResponse.json(
      { error: "Failed to save board" },
      { status: 500 }
    );
  }
}
