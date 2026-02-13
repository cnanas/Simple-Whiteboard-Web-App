"use client";

import { CHANGELOG_ENTRIES } from "@/lib/changelog";

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/20 dark:bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Changelog"
        className="fixed left-1/2 top-1/2 z-[61] w-[min(90vw,420px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2
          rounded-xl bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-xl
          flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 shrink-0">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Changelog</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">
          {CHANGELOG_ENTRIES.map((entry) => (
            <div key={entry.version} className="mb-4 last:mb-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {entry.version} · {entry.date}
              </p>
              <ul className="mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                {entry.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
