"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useBoardStore } from "@/store/boardStore";
import { PasswordModal } from "./PasswordModal";

interface LockedOverlayProps {
  widgetId: string;
}

export function LockedOverlay({ widgetId }: LockedOverlayProps) {
  const [showModal, setShowModal] = useState(false);
  const unlockWidget = useBoardStore((s) => s.unlockWidget);

  return (
    <>
      <div
        className="absolute inset-0 z-20 rounded-xl overflow-hidden
          bg-white/60 dark:bg-black/40 backdrop-blur-md
          flex flex-col items-center justify-center gap-2 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="text-gray-400 dark:text-gray-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Locked
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="mt-1 px-3 py-1 rounded-lg text-xs font-medium
            bg-blue-500 hover:bg-blue-600 text-white
            transition-colors"
        >
          Unlock
        </button>
      </div>

      {showModal && createPortal(
        <PasswordModal
          mode="unlock"
          onSubmit={async (password) => {
            const success = await unlockWidget(widgetId, password);
            if (success) setShowModal(false);
            return success;
          }}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}
    </>
  );
}
