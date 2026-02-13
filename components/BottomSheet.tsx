"use client";

import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** When true, sheet is visible on desktop too (e.g. for widget detail from list view) */
  showOnDesktop?: boolean;
  /** When 'lg', sheet is visible below lg breakpoint (for FAB menu on tablet). Default 'md'. */
  hideAboveBreakpoint?: "md" | "lg";
}

export function BottomSheet({ open, onClose, children, showOnDesktop, hideAboveBreakpoint = "md" }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const hideClass = showOnDesktop ? "" : hideAboveBreakpoint === "lg" ? "lg:hidden" : "md:hidden";
  return (
    <div className={`fixed inset-0 z-[60] ${hideClass}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0
          bg-white dark:bg-[#1e2328]
          rounded-t-2xl shadow-2xl
          border-t border-black/5 dark:border-white/10
          animate-slide-up
          ${showOnDesktop ? "max-h-[85vh] overflow-hidden flex flex-col" : ""}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Content */}
        <div className={`px-4 pb-8 overflow-y-auto ${showOnDesktop ? "flex-1 min-h-0" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
