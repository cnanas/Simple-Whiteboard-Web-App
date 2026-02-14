"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useBoardStore } from "@/store/boardStore";
import { AuthModal } from "./AuthModal";

export function AuthMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const widgets = useBoardStore((s) => s.widgets);
  const viewport = useBoardStore((s) => s.viewport);
  const loadBoard = useBoardStore((s) => s.loadBoard);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const showMessage = (type: "ok" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveToCloud = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets, viewport }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      showMessage("ok", "Saved to cloud");
      setOpen(false);
    } catch (e) {
      showMessage("error", e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadFromCloud = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/board");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Load failed");
      }
      const json = await res.json();
      if (json.data?.widgets && Array.isArray(json.data.widgets)) {
        const valid = json.data.widgets.filter(
          (w: unknown) => w != null && typeof w === "object" && "id" in w && "type" in w
        );
        const vp =
          json.data.viewport && typeof json.data.viewport === "object"
            ? {
                x: Number(json.data.viewport.x) || 0,
                y: Number(json.data.viewport.y) || 0,
                zoom: Number(json.data.viewport.zoom) || 1,
              }
            : { x: 0, y: 0, zoom: 1 };
        loadBoard(valid, vp);
        showMessage("ok", "Loaded from cloud");
      } else {
        showMessage("ok", "No saved board");
      }
      setOpen(false);
    } catch (e) {
      showMessage("error", e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <div className="relative">
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0
              bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
              text-gray-700 dark:text-gray-200 text-sm font-medium
              transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg
            bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-200 text-sm font-medium
            transition-colors duration-150"
          title="Account & cloud"
        >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
            {(session.user?.name ?? session.user?.email ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[100px] truncate hidden sm:inline">
          {session.user?.name ?? session.user?.email ?? "Account"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 py-1 min-w-[180px] rounded-lg
          bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-lg z-[100]">
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/10">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={saveToCloud}
            disabled={saving}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save to cloud"}
          </button>
          <button
            onClick={loadFromCloud}
            disabled={loading}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load from cloud"}
          </button>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400
              hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
          {message && (
            <div
              className={`px-3 py-2 text-xs ${
                message.type === "ok"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
