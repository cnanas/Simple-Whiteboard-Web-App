"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthModal } from "./AuthModal";

export function WelcomeToast() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    // Only show for unauthenticated users
    if (status === "unauthenticated") {
      const hasSeenToast = localStorage.getItem("hasSeenWelcomeToast");
      if (!hasSeenToast && !dismissed) {
        // Show toast after a short delay
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("hasSeenWelcomeToast", "true");
  };

  const handleSignIn = () => {
    localStorage.setItem("hasSeenWelcomeToast", "true");
    setShowAuthModal(true);
  };

  if (status !== "unauthenticated" || !visible) return null;

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div
        className={`fixed top-4 right-4 z-[60] max-w-sm transition-all duration-500 ease-out
          ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
      >
      <div
        className="rounded-2xl bg-white/95 dark:bg-[#1a1f26]/95 backdrop-blur-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          border border-black/[0.08] dark:border-white/[0.12]
          p-4 pr-3"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full
            flex items-center justify-center
            text-gray-400 dark:text-gray-500
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
            flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Welcome to Whiteboard
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Sign in to save your boards to the cloud and collaborate with others in real-time
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignIn}
                className="flex-1 px-3 py-1.5 rounded-lg
                  bg-blue-600 hover:bg-blue-700
                  text-white text-xs font-medium
                  transition-colors shadow-sm"
              >
                Sign in
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg
                  text-gray-600 dark:text-gray-400 text-xs font-medium
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
