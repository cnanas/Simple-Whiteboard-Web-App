"use client";

import { type ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { CollaborationSync } from "./CollaborationSync";
import { LiveCursors } from "./LiveCursors";

interface CollaborativeRoomProps {
  roomId: string;
  children: ReactNode;
}

export function CollaborativeRoom({ roomId, children }: CollaborativeRoomProps) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        name: "",
        avatar: undefined,
        color: "#2563EB",
        selectedWidgetId: null,
      }}
      initialStorage={{
        widgets: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      }}
    >
      <CollaborationSync roomId={roomId} />
      <LiveCursors />
      {children}
    </RoomProvider>
  );
}
