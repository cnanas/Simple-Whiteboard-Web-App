"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/boardStore";
import { BottomSheet } from "./BottomSheet";
import { WIDGET_OPTIONS } from "./WidgetPicker";
import type { WidgetType } from "@/types";
import { exportToTxt, exportToPdf } from "@/lib/export";
import { ThemeToggle } from "./ThemeToggle";
import { AuthMenu } from "./AuthMenu";
import { ChangelogModal } from "./ChangelogModal";

export function FAB() {
  const [open, setOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const addWidget = useBoardStore((s) => s.addWidget);
  const widgets = useBoardStore((s) => s.widgets);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  const close = () => setOpen(false);

  return (
    <>
      {/* FAB button — mobile/tablet only (visible when bottom bar is hidden) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-50 lg:hidden
          w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600
          shadow-lg shadow-blue-500/25
          flex items-center justify-center
          text-white transition-transform active:scale-95"
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <BottomSheet open={open} onClose={close} showOnDesktop={false} hideAboveBreakpoint="lg">
        <div className="space-y-6 pb-6">
          {/* Add Widget */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Add widget
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {WIDGET_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    addWidget(option.type as WidgetType);
                    close();
                  }}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl
                    bg-gray-50 dark:bg-gray-800/50
                    hover:bg-gray-100 dark:hover:bg-gray-700/50
                    transition-colors text-gray-600 dark:text-gray-400"
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Export */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Export
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  exportToTxt(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.txt`);
                  close();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                TXT
              </button>
              <button
                onClick={async () => {
                  await exportToPdf(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.pdf`);
                  close();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
              >
                PDF
              </button>
            </div>
          </section>

          {/* View mode */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              View
            </h3>
            <button
              onClick={() => {
                setViewMode(viewMode === "canvas" ? "list" : "canvas");
                close();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
            >
              {viewMode === "canvas" ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  Switch to list view
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M18 9l-5 5-4-4-3 3" />
                  </svg>
                  Switch to canvas view
                </>
              )}
            </button>
          </section>

          {/* Theme & Changelog & Account row */}
          <section className="flex flex-wrap items-center gap-2">
            <div className="[&_button]:!rounded-xl [&_button]:!p-2.5">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowChangelog(true);
                close();
              }}
              className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium"
            >
              Changelog
            </button>
            <div className="[&_button]:!rounded-xl [&_button]:!px-3 [&_button]:!py-2.5 [&_button]:!text-sm">
              <AuthMenu />
            </div>
          </section>
        </div>
      </BottomSheet>

      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}
    </>
  );
}
