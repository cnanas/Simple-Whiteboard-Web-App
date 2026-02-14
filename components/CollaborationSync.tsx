"use client";

import { useEffect, useRef, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import { useCollaborationStore } from "@/store/collaborationStore";
import { useStorage, useMutation } from "@/liveblocks.config";
import type { Widget, Viewport } from "@/types";
import type { JsonObject } from "@liveblocks/client";

/**
 * Bidirectional sync between local Zustand boardStore and Liveblocks storage.
 * - On mount: loads room data into local store
 * - On local changes: pushes to Liveblocks
 * - On remote changes: pulls into local store
 */
export function CollaborationSync({ roomId }: { roomId: string }) {
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const localWidgets = useBoardStore((s) => s.widgets);
  const localViewport = useBoardStore((s) => s.viewport);

  const remoteWidgets = useStorage((root) => root.widgets) as unknown as Widget[] | null;
  const remoteViewport = useStorage((root) => root.viewport) as unknown as Viewport | null;

  // Track sync direction to prevent loops
  const syncSource = useRef<"local" | "remote" | null>(null);
  const hasInitialized = useRef(false);

  // Mark this session as collaborative
  useEffect(() => {
    useCollaborationStore.getState().setRoom(roomId);
    return () => {
      useCollaborationStore.getState().setRoom(null);
    };
  }, [roomId]);

  // Push local state to Liveblocks
  const pushToRemote = useMutation(
    ({ storage }, widgets: Widget[], viewport: Viewport) => {
      storage.set("widgets", widgets as unknown as JsonObject[]);
      storage.set("viewport", viewport as unknown as JsonObject);
    },
    []
  );

  // Initialize: load remote data into local store on first connection
  useEffect(() => {
    if (hasInitialized.current) return;
    if (remoteWidgets === null) return;

    hasInitialized.current = true;

    // If remote has data, load it. Otherwise push local state to remote.
    if (remoteWidgets.length > 0) {
      syncSource.current = "remote";
      loadBoard(
        remoteWidgets,
        remoteViewport ?? { x: 0, y: 0, zoom: 1 }
      );
    } else if (localWidgets.length > 0) {
      syncSource.current = "local";
      pushToRemote(localWidgets, localViewport);
    }
  }, [remoteWidgets, remoteViewport, localWidgets, localViewport, loadBoard, pushToRemote]);

  // Sync remote changes -> local (after initialization)
  const prevRemoteRef = useRef<string>("");
  useEffect(() => {
    if (!hasInitialized.current || remoteWidgets === null) return;

    const remoteKey = JSON.stringify(remoteWidgets);
    if (remoteKey === prevRemoteRef.current) return;
    prevRemoteRef.current = remoteKey;

    if (syncSource.current === "local") {
      syncSource.current = null;
      return;
    }

    syncSource.current = "remote";
    loadBoard(
      remoteWidgets,
      remoteViewport ?? { x: 0, y: 0, zoom: 1 }
    );
  }, [remoteWidgets, remoteViewport, loadBoard]);

  // Sync local changes -> remote (after initialization)
  const prevLocalRef = useRef<string>("");
  const debouncedPush = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushDebounced = useCallback(
    (widgets: Widget[], viewport: Viewport) => {
      if (debouncedPush.current) clearTimeout(debouncedPush.current);
      debouncedPush.current = setTimeout(() => {
        syncSource.current = "local";
        pushToRemote(widgets, viewport);
      }, 100);
    },
    [pushToRemote]
  );

  useEffect(() => {
    if (!hasInitialized.current) return;

    const localKey = JSON.stringify(localWidgets);
    if (localKey === prevLocalRef.current) return;
    prevLocalRef.current = localKey;

    if (syncSource.current === "remote") {
      syncSource.current = null;
      return;
    }

    pushDebounced(localWidgets, localViewport);
  }, [localWidgets, localViewport, pushDebounced]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedPush.current) clearTimeout(debouncedPush.current);
    };
  }, []);

  return null;
}
