"use client";

import { useState, useRef, useEffect } from "react";

interface PasswordModalProps {
  mode: "lock" | "unlock";
  onSubmit: (password: string) => Promise<boolean | void>;
  onClose: () => void;
}

export function PasswordModal({ mode, onSubmit, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (mode === "lock" && password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const result = await onSubmit(password);
    setLoading(false);

    if (result === false) {
      setError("Wrong password");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-80 bg-white dark:bg-[#1e2328] rounded-2xl shadow-2xl
          border border-black/10 dark:border-white/10 p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-blue-500">
              {mode === "lock" ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </>
              )}
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {mode === "lock" ? "Lock Widget" : "Unlock Widget"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mode === "lock"
                ? "Set a password to encrypt this widget"
                : "Enter the password to decrypt"}
            </p>
          </div>
        </div>

        {/* Password field */}
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
            outline-none focus:border-blue-500 dark:focus:border-blue-400
            transition-colors mb-2"
        />

        {/* Confirm field (lock mode only) */}
        {mode === "lock" && (
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200
              placeholder-gray-400 dark:placeholder-gray-500
              outline-none focus:border-blue-500 dark:focus:border-blue-400
              transition-colors mb-2"
          />
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium
              text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium
              bg-blue-500 hover:bg-blue-600 text-white
              disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : mode === "lock" ? "Lock" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
