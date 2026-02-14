"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useBoardStore } from "@/store/boardStore";
import type { WidgetType } from "@/types";
import { WIDGET_OPTIONS } from "./WidgetPicker";
import { ThemeToggle } from "./ThemeToggle";
import { AuthMenu } from "./AuthMenu";
import { AuthModal } from "./AuthModal";
import { exportToTxt, exportToPdf } from "@/lib/export";
import { ChangelogModal } from "./ChangelogModal";
import { MarkdownImportDialog } from "./MarkdownImportDialog";
import { TemplatesDialog } from "./TemplatesDialog";

function getOption(type: WidgetType) {
  return WIDGET_OPTIONS.find((o) => o.type === type);
}

export function BottomBar() {
  const [showWidgetGrid, setShowWidgetGrid] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [showExportSub, setShowExportSub] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showMarkdownImport, setShowMarkdownImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const widgetGridRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  const quickActions = useBoardStore((s) => s.quickActions);
  const setQuickActions = useBoardStore((s) => s.setQuickActions);
  const addWidget = useBoardStore((s) => s.addWidget);
  const widgets = useBoardStore((s) => s.widgets);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);
  const { data: session, status } = useSession();

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetGridRef.current && !widgetGridRef.current.contains(e.target as Node)) {
        setShowWidgetGrid(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
        setShowExportSub(false);
      }
    };
    if (showWidgetGrid || showOverflow) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showWidgetGrid, showOverflow]);

  const toggleInQuickActions = (type: WidgetType) => {
    if (quickActions.includes(type)) {
      if (quickActions.length <= 1) return; // keep at least one
      setQuickActions(quickActions.filter((t) => t !== type));
    } else {
      setQuickActions([...quickActions, type]);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-0.5
          px-2 py-1.5 rounded-2xl bg-white/95 dark:bg-[#1a1f26]/95 backdrop-blur-md
          shadow-[0_2px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.5)]
          border border-black/[0.06] dark:border-white/10"
        data-tour="quick-actions"
      >
        {/* Quick action buttons with labels */}
        {quickActions.map((type) => {
          const opt = getOption(type);
          if (!opt) return null;
          return (
            <button
              key={type}
              onClick={() => addWidget(type)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-white/10
                hover:text-gray-700 dark:hover:text-gray-200
                transition-colors duration-150
                [&_svg]:w-[18px] [&_svg]:h-[18px]"
              title={opt.label}
            >
              {opt.icon}
              <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 mx-1 bg-gray-200/80 dark:bg-white/10 rounded-full flex-shrink-0" aria-hidden />

        {/* + More button */}
        <div className="relative" ref={widgetGridRef}>
          <button
            onClick={() => { setShowWidgetGrid((v) => !v); setShowOverflow(false); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-white/10
              hover:text-gray-700 dark:hover:text-gray-200
              transition-colors duration-150"
            title="Add widget"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>

          {/* Widget grid popover */}
          {showWidgetGrid && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[280px] rounded-2xl
              bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10
              shadow-xl z-[100] overflow-hidden">
              {/* Add Widgets grid */}
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">
                  Add Widget
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {WIDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        addWidget(opt.type);
                        setShowWidgetGrid(false);
                      }}
                      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl
                        text-gray-500 dark:text-gray-400
                        hover:bg-gray-100 dark:hover:bg-white/10
                        hover:text-gray-700 dark:hover:text-gray-200
                        transition-colors [&_svg]:w-5 [&_svg]:h-5"
                    >
                      {opt.icon}
                      <span className="text-[11px] font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customize bar section */}
              <div className="border-t border-black/5 dark:border-white/5 px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 px-1">
                  Quick Bar
                </p>
                <div className="flex flex-wrap gap-1">
                  {WIDGET_OPTIONS.map((opt) => {
                    const isActive = quickActions.includes(opt.type);
                    return (
                      <button
                        key={opt.type}
                        onClick={() => toggleInQuickActions(opt.type)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                          ${isActive
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                          } [&_svg]:w-3.5 [&_svg]:h-3.5`}
                        title={isActive ? `Remove ${opt.label} from bar` : `Add ${opt.label} to bar`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 mx-1 bg-gray-200/80 dark:bg-white/10 rounded-full flex-shrink-0" aria-hidden />

        {/* User avatar / Sign in */}
        {status === "authenticated" && session?.user ? (
          <div className="flex items-center">
            <AuthMenu />
          </div>
        ) : status !== "loading" ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-white/10
              hover:text-gray-700 dark:hover:text-gray-200
              transition-colors text-xs font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </button>
        ) : null}

        {/* More/overflow button */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => { setShowOverflow((v) => !v); setShowWidgetGrid(false); }}
            className={`flex items-center justify-center w-8 h-8 rounded-xl
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-white/10
              hover:text-gray-700 dark:hover:text-gray-200
              transition-colors duration-150
              ${showOverflow ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200" : ""}`}
            title="More options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {/* Overflow menu popover */}
          {showOverflow && (
            <div className="absolute bottom-full right-0 mb-3 w-[200px] rounded-2xl
              bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10
              shadow-xl z-[100] py-1.5 overflow-hidden">

              {/* View toggle */}
              <button
                onClick={() => {
                  setViewMode(viewMode === "canvas" ? "list" : "canvas");
                  setShowOverflow(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                {viewMode === "canvas" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M18 9l-5 5-4-4-3 3" />
                  </svg>
                )}
                {viewMode === "canvas" ? "List view" : "Canvas view"}
              </button>

              {/* Divider */}
              <div className="mx-3 my-1 h-px bg-gray-100 dark:bg-white/5" />

              {/* Import Markdown */}
              <button
                onClick={() => {
                  setShowOverflow(false);
                  setShowMarkdownImport(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import Markdown
              </button>

              {/* Templates */}
              <button
                onClick={() => {
                  setShowOverflow(false);
                  setShowTemplates(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Templates
              </button>

              {/* Divider */}
              <div className="mx-3 my-1 h-px bg-gray-100 dark:bg-white/5" />

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => setShowExportSub((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {showExportSub && (
                  <div className="px-2 pb-1">
                    <button
                      onClick={() => {
                        exportToTxt(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.txt`);
                        setShowOverflow(false);
                        setShowExportSub(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300
                        hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Export as TXT
                    </button>
                    <button
                      onClick={async () => {
                        await exportToPdf(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.pdf`);
                        setShowOverflow(false);
                        setShowExportSub(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300
                        hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="mx-3 my-1 h-px bg-gray-100 dark:bg-white/5" />

              {/* Theme toggle */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700 dark:text-gray-200">Theme</span>
                <ThemeToggle />
              </div>

              {/* Divider */}
              <div className="mx-3 my-1 h-px bg-gray-100 dark:bg-white/5" />

              {/* Changelog */}
              <button
                onClick={() => {
                  setShowOverflow(false);
                  setShowChangelog(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Changelog
              </button>
            </div>
          )}
        </div>
      </div>

      {showChangelog && createPortal(
        <ChangelogModal onClose={() => setShowChangelog(false)} />,
        document.body
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <MarkdownImportDialog
        isOpen={showMarkdownImport}
        onClose={() => setShowMarkdownImport(false)}
      />

      <TemplatesDialog
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </>
  );
}
