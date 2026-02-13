"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useBoardStore } from "@/store/boardStore";

const SAVE_DEBOUNCE_MS = 2000;

/**
 * Auto-load board from API when user is signed in (on mount).
 * Auto-save board to API when user is signed in and state changes (debounced).
 */
export function BoardSync() {
  const { data: session, status } = useSession();
  const widgets = useBoardStore((s) => s.widgets);
  const viewport = useBoardStore((s) => s.viewport);
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const hasLoadedOnce = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") hasLoadedOnce.current = false;
  }, [status]);

  // Auto-load from cloud once when session is available
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || hasLoadedOnce.current) return;
    hasLoadedOnce.current = true;
    let cancelled = false;
    fetch("/api/board")
      .then((res) => {
        if (!res.ok || cancelled) return null;
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json?.data) return;
        const raw = json.data.widgets;
        const valid = Array.isArray(raw)
          ? raw.filter(
              (w: unknown) => w != null && typeof w === "object" && "id" in w && "type" in w
            )
          : [];
        const vp = json.data.viewport;
        const viewport =
          vp && typeof vp === "object"
            ? {
                x: Number(vp.x) || 0,
                y: Number(vp.y) || 0,
                zoom: Number(vp.zoom) || 1,
              }
            : { x: 0, y: 0, zoom: 1 };
        loadBoard(valid, viewport);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, loadBoard]);

  // Auto-save to cloud when signed in and state changes (debounced)
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveTimeout.current = null;
      fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets, viewport }),
      }).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [status, session?.user?.id, widgets, viewport]);

  return null;
}
