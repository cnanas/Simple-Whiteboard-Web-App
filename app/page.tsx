"use client";

import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { FAB } from "@/components/FAB";
import { WidgetListView } from "@/components/WidgetListView";
import { MobileHeader } from "@/components/MobileHeader";
import { useBoardStore } from "@/store/boardStore";

export default function Home() {
  const viewMode = useBoardStore((s) => s.viewMode);

  return (
    <>
      {viewMode === "list" ? <WidgetListView /> : <Canvas />}
      <MobileHeader />
      <Toolbar />
      <FAB />
    </>
  );
}
