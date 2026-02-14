"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderSignIn = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#1a1f26] rounded-2xl shadow-2xl
          border border-black/10 dark:border-white/10 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full z-10
            flex items-center justify-center
            text-gray-400 dark:text-gray-500
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 py-8 text-center border-b border-black/5 dark:border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600
            flex items-center justify-center shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Whiteboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to save your boards and collaborate in real-time
          </p>
        </div>

        {/* Sign-in options */}
        <div className="px-6 py-6 space-y-3">
          {/* GitHub */}
          <button
            onClick={() => handleProviderSignIn("github")}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700
              text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "github" ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>

          {/* Apple */}
          <button
            onClick={() => handleProviderSignIn("apple")}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100
              text-white dark:text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "apple" ? (
              <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.569 12.562c-.023-2.484 2.027-3.68 2.12-3.738-1.154-1.688-2.952-1.919-3.591-1.945-1.53-.154-2.985.9-3.761.9-.776 0-1.974-.878-3.244-.854-1.67.024-3.21.971-4.068 2.467-1.735 3.002-.444 7.45 1.247 9.886.826 1.192 1.812 2.532 3.106 2.485 1.27-.05 1.75-.821 3.286-.821 1.536 0 1.968.821 3.244.796 1.338-.024 2.208-1.212 3.034-2.404.954-1.381 1.348-2.717 1.372-2.786-.03-.013-2.631-1.01-2.654-4.005l-.091.019zM14.753 3.475c.687-.833 1.15-1.99 1.024-3.145-1.988.08-4.396 1.325-5.82 2.994-.638.739-1.197 1.713-1.047 2.724 1.108.086 2.237-.561 2.964-1.258.727-.698 1.311-1.811 1.879-1.315z" />
              </svg>
            )}
            <span>Continue with Apple</span>
          </button>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1f26]">
                OR
              </span>
            </div>
          </div>

          {/* Email */}
          <button
            onClick={() => handleProviderSignIn("email")}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
              text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "email" ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            )}
            <span>Continue with Email</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
