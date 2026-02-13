"use client";

import { useBoardStore } from "@/store/boardStore";
import { AuthMenu } from "./AuthMenu";

/** Shown on mobile when on canvas so user can switch to list view and sign in */
export function MobileHeader() {
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  if (viewMode !== "canvas") return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 md:hidden
        pt-[env(safe-area-inset-top)] px-4 py-2
        bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md
        border-b border-black/5 dark:border-white/10
        flex items-center justify-between gap-2"
    >
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <AuthMenu />
        <button
          onClick={() => setViewMode("list")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl
          bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 text-sm font-medium
          transition-colors duration-150"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
          List
        </button>
      </div>
    </div>
  );
}
