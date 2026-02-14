import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Liveblocks } from "@liveblocks/node";

const COLORS = [
  "#DC2626", "#EA580C", "#D97706", "#65A30D",
  "#059669", "#0891B2", "#2563EB", "#7C3AED",
  "#C026D3", "#E11D48",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export async function POST(request: Request) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return NextResponse.json(
      { error: "Liveblocks not configured" },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY,
  });

  const { room } = await request.json();
  const color = COLORS[Math.abs(hashString(session.user.id)) % COLORS.length];

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? session.user.email ?? "Anonymous",
      email: session.user.email ?? "",
      avatar: session.user.image ?? undefined,
      color,
    },
  });

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

  const { body, status } = await liveblocksSession.authorize();
  return new NextResponse(body, { status });
}
