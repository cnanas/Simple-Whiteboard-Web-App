"use client";

import { useEffect } from "react";

/** Registers the service worker for offline / PWA support */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {})
      .catch(() => {});
  }, []);

  return <>{children}</>;
}
