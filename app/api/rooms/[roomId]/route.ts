import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

/** GET /api/rooms/:roomId — get room details */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const rows = await sql`
      SELECT r.*, rm.role
      FROM rooms r
      LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = ${session.user.id}
      WHERE r.id = ${roomId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: rows[0] });
  } catch (e) {
    console.error("Room get error:", e);
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 });
  }
}

/** DELETE /api/rooms/:roomId — delete room (owner only) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sql) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Check ownership
    const rows = await sql`
      SELECT owner_id FROM rooms WHERE id = ${roomId} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (rows[0].owner_id !== session.user.id) {
      return NextResponse.json({ error: "Not the room owner" }, { status: 403 });
    }

    await sql`DELETE FROM rooms WHERE id = ${roomId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Room delete error:", e);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
