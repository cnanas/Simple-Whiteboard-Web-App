"use client";

import { useState, useEffect } from "react";
import { SplashScreen } from "./SplashScreen";
import { hasSeenSplash } from "@/lib/onboarding";
import { runTutorial } from "@/lib/tour";
import { useBoardStore } from "@/store/boardStore";

const TOUR_DELAY_MS = 500;

export function Onboarding({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  useEffect(() => {
    if (typeof window !== "undefined" && hasSeenSplash()) {
      setShowSplash(false);
    }
  }, []);

  const handleContinue = () => {
    setShowSplash(false);
    setViewMode("canvas");
    setTimeout(() => {
      runTutorial();
    }, TOUR_DELAY_MS);
  };

  return (
    <>
      {showSplash && <SplashScreen onContinue={handleContinue} />}
      {children}
    </>
  );
}
