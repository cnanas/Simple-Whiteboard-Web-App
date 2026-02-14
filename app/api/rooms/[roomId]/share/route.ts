import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { nanoid } from "nanoid";

/** POST /api/rooms/:roomId/share — generate a share link */
export async function POST(
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
    // Verify user is a member of the room
    const members = await sql`
      SELECT role FROM room_members
      WHERE room_id = ${roomId} AND user_id = ${session.user.id}
      LIMIT 1
    `;

    if (members.length === 0) {
      return NextResponse.json({ error: "Not a room member" }, { status: 403 });
    }

    const linkId = nanoid(16);

    await sql`
      INSERT INTO share_links (id, room_id, created_by, permission)
      VALUES (${linkId}, ${roomId}, ${session.user.id}, 'edit')
    `;

    return NextResponse.json({ linkId, roomId });
  } catch (e) {
    console.error("Share link create error:", e);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

/** GET /api/rooms/:roomId/share?token=... — join room via share link */
export async function GET(
  request: Request,
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

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing share token" }, { status: 400 });
  }

  try {
    // Verify the share link exists and is valid
    const links = await sql`
      SELECT * FROM share_links
      WHERE id = ${token} AND room_id = ${roomId}
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    if (links.length === 0) {
      return NextResponse.json({ error: "Invalid or expired share link" }, { status: 404 });
    }

    // Add user as a member (ignore conflict if already a member)
    await sql`
      INSERT INTO room_members (room_id, user_id, role)
      VALUES (${roomId}, ${session.user.id}, 'editor')
      ON CONFLICT (room_id, user_id) DO NOTHING
    `;

    return NextResponse.json({ ok: true, roomId });
  } catch (e) {
    console.error("Share link join error:", e);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
