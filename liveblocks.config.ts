import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { JsonObject } from "@liveblocks/client";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  avatar?: string;
  color: string;
  selectedWidgetId: string | null;
};

// Storage uses JsonObject-compatible types.
// Consumers cast to Widget[]/Viewport when reading.
export type Storage = {
  widgets: JsonObject[];
  viewport: JsonObject;
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    avatar?: string;
    color: string;
  };
};

export type RoomEvent = Record<string, never>;

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useSelf,
  useStorage,
  useMutation,
  useBroadcastEvent,
  useStatus,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
