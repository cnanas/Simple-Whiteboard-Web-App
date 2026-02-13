"use client";

import { Canvas } from "@/components/Canvas";
import { BottomBar } from "@/components/BottomBar";
import { ZoomIndicator } from "@/components/ZoomIndicator";
import { FAB } from "@/components/FAB";
import { WidgetListView } from "@/components/WidgetListView";
import { MobileHeader } from "@/components/MobileHeader";
import { Onboarding } from "@/components/Onboarding";
import { useBoardStore } from "@/store/boardStore";

export default function Home() {
  const viewMode = useBoardStore((s) => s.viewMode);

  return (
    <Onboarding>
      {viewMode === "list" ? <WidgetListView /> : <Canvas />}
      <MobileHeader />
      <BottomBar />
      <ZoomIndicator />
      <FAB />
    </Onboarding>
  );
}
