"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useBoardStore } from "@/store/boardStore";
import { useHistoryStore } from "@/store/historyStore";
import { ThemeToggle } from "./ThemeToggle";
import { exportToTxt, exportToPdf } from "@/lib/export";
import { AuthMenu } from "./AuthMenu";

export function Toolbar() {
  const [showExport, setShowExport] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const widgets = useBoardStore((s) => s.widgets);
  const viewport = useBoardStore((s) => s.viewport);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());
  const { status } = useSession();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    if (showExport) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExport]);

  const handleCreateRoom = async () => {
    if (creatingRoom) return;
    setCreatingRoom(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Board",
          widgets,
          viewport,
        }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const { roomId } = await res.json();
      window.location.href = `/board/${roomId}`;
    } catch {
      setCreatingRoom(false);
    }
  };

  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2
      px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md
      border border-black/5 dark:border-white/10 shadow-lg">
      {/* Export */}
      <div className="relative" ref={exportRef}>
        <button
          onClick={() => setShowExport(!showExport)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-200 text-sm font-medium
            transition-colors duration-150"
          title="Export board"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
        {showExport && (
          <div className="absolute top-full left-0 mt-1 py-1 min-w-[140px] rounded-lg
            bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-lg z-[100]">
            <button
              onClick={() => {
                const date = new Date().toISOString().slice(0, 10);
                exportToTxt(widgets, `whiteboard-${date}.txt`);
                setShowExport(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-white/10 rounded-t-lg transition-colors"
            >
              Export as TXT
            </button>
            <button
              onClick={async () => {
                const date = new Date().toISOString().slice(0, 10);
                await exportToPdf(widgets, `whiteboard-${date}.pdf`);
                setShowExport(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-white/10 rounded-b-lg transition-colors"
            >
              Export as PDF
            </button>
          </div>
        )}
      </div>

      {/* Undo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 text-sm font-medium
          transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Undo (Cmd+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 text-sm font-medium
          transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Redo (Cmd+Shift+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
      </button>

      {/* List / Canvas toggle */}
      <button
        onClick={() => setViewMode(viewMode === "canvas" ? "list" : "canvas")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 text-sm font-medium
          transition-colors duration-150"
        title={viewMode === "canvas" ? "Switch to list view" : "Switch to canvas"}
      >
        {viewMode === "canvas" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
            Canvas
          </>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

      {/* Collaborate button (only when signed in) */}
      {status === "authenticated" && (
        <button
          onClick={handleCreateRoom}
          disabled={creatingRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
            transition-colors duration-150 disabled:opacity-50"
          title="Start a collaborative session"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {creatingRoom ? "Creating..." : "Collaborate"}
        </button>
      )}

      {/* Sign in / Account & cloud */}
      <AuthMenu />

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  );
}
