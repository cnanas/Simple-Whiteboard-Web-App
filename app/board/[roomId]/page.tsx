"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Canvas } from "@/components/Canvas";
import { BottomBar } from "@/components/BottomBar";
import { ZoomIndicator } from "@/components/ZoomIndicator";
import { FAB } from "@/components/FAB";
import { CollaborativeRoom } from "@/components/CollaborativeRoom";
import { PresenceAvatars } from "@/components/PresenceAvatars";
import { CommandPalette } from "@/components/CommandPalette";
import { SearchPanel } from "@/components/SearchPanel";
import { ShareDialog } from "@/components/ShareDialog";
import { useBoardStore } from "@/store/boardStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSearchParams } from "next/navigation";

export default function CollaborativeBoardPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<"idle" | "joining" | "joined" | "error">("idle");

  const focusWidget = useBoardStore((s) => s.focusWidget);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  useKeyboardShortcuts({
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onSearch: () => setIsSearchPanelOpen(true),
    selectedWidgetId,
  });

  // Auto-join via share token
  useEffect(() => {
    if (!token || status !== "authenticated" || joinStatus !== "idle") return;

    setJoinStatus("joining");
    fetch(`/api/rooms/${roomId}/share?token=${token}`)
      .then((res) => {
        if (res.ok) {
          setJoinStatus("joined");
          // Clean the token from URL
          window.history.replaceState({}, "", `/board/${roomId}`);
        } else {
          setJoinStatus("error");
        }
      })
      .catch(() => setJoinStatus("error"));
  }, [token, roomId, status, joinStatus]);

  const handleSelectWidget = (widgetId: string) => {
    setSelectedWidgetId(widgetId);
    if (useBoardStore.getState().viewMode !== "canvas") {
      setViewMode("canvas");
    }
    focusWidget(widgetId);
  };

  // Auth gate
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f1419]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f1419]">
        <div className="text-center max-w-sm mx-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sign in to collaborate
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You need to be signed in to join this collaborative board.
          </p>
          <a
            href={`/auth/signin?callbackUrl=/board/${roomId}${token ? `?token=${token}` : ""}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <CollaborativeRoom roomId={roomId}>
      <Canvas />
      <BottomBar />
      <ZoomIndicator />
      <FAB />

      {/* Collaboration toolbar overlay */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <PresenceAvatars />
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
      </div>

      {/* Collaborative badge */}
      <div className="fixed top-4 left-4 z-50 px-3 py-1.5 rounded-lg bg-green-600/90 text-white text-xs font-medium shadow-lg flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
        Live
      </div>

      <ShareDialog
        roomId={roomId}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectWidget={handleSelectWidget}
      />
      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        onSelectWidget={handleSelectWidget}
      />
    </CollaborativeRoom>
  );
}
