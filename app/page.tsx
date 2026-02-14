"use client";

import { useState } from "react";
import { Canvas } from "@/components/Canvas";
import { BottomBar } from "@/components/BottomBar";
import { ZoomIndicator } from "@/components/ZoomIndicator";
import { FAB } from "@/components/FAB";
import { WidgetListView } from "@/components/WidgetListView";
import { MobileHeader } from "@/components/MobileHeader";
import { Onboarding } from "@/components/Onboarding";
import { BoardSync } from "@/components/BoardSync";
import { CommandPalette } from "@/components/CommandPalette";
import { SearchPanel } from "@/components/SearchPanel";
import { useBoardStore } from "@/store/boardStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const viewMode = useBoardStore((s) => s.viewMode);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onSearch: () => setIsSearchPanelOpen(true),
    selectedWidgetId,
  });

  const focusWidget = useBoardStore((s) => s.focusWidget);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  const handleSelectWidget = (widgetId: string) => {
    setSelectedWidgetId(widgetId);
    if (useBoardStore.getState().viewMode !== "canvas") {
      setViewMode("canvas");
    }
    focusWidget(widgetId);
  };

  return (
    <Onboarding>
      <BoardSync />
      {viewMode === "list" ? <WidgetListView /> : <Canvas />}
      <MobileHeader />
      <BottomBar />
      <ZoomIndicator />
      <FAB />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectWidget={handleSelectWidget}
      />

      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        onSelectWidget={handleSelectWidget}
      />
    </Onboarding>
  );
}
