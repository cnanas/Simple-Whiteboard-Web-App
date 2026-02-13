"use client";

import Link from "next/link";
import { setSeenSplash } from "@/lib/onboarding";

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const handleContinue = () => {
    setSeenSplash();
    onContinue();
  };

  const handleSignUp = () => {
    setSeenSplash();
    // Navigation is handled by Link
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8
        bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#0f1419] dark:to-[#1a1f26]
        px-6"
      role="dialog"
      aria-label="Welcome"
    >
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-3 3" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Whiteboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your open canvas for notes, tasks, and planning. Pan, zoom, and add widgets to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <Link
          href="/auth/signin"
          onClick={handleSignUp}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl
            bg-blue-500 hover:bg-blue-600 text-white font-medium
            transition-colors duration-150"
        >
          Sign up / Sign in
        </Link>
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3 px-4 rounded-xl
            bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10
            text-gray-700 dark:text-gray-200 font-medium
            hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
        >
          Continue without signing up
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[260px]">
        You can sign in later to save your board to the cloud.
      </p>
    </div>
  );
}
