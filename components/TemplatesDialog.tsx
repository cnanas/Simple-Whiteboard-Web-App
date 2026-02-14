"use client";

import { createPortal } from "react-dom";
import { useBoardStore } from "@/store/boardStore";
import { nanoid } from "nanoid";
import type { Widget } from "@/types";
import { STICKY_COLORS } from "@/types";

interface TemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: "sprint-planning",
    name: "Sprint Planning",
    description: "Task list, calendar, and focus widget for sprint organization",
    icon: "🏃",
    widgets: [
      { type: "taskList" as const, x: 100, y: 100, title: "Sprint Backlog" },
      { type: "calendar" as const, x: 380, y: 100 },
      { type: "focus" as const, x: 100, y: 340, title: "Sprint Goals" },
      { type: "dayPlanner" as const, x: 380, y: 400 },
    ],
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Notepad, sticky notes grid, and task list for meeting documentation",
    icon: "📝",
    widgets: [
      { type: "notepad" as const, x: 100, y: 100, width: 400, height: 300 },
      { type: "sticky" as const, x: 530, y: 100, content: "Action Items" },
      { type: "sticky" as const, x: 760, y: 100, content: "Key Decisions" },
      { type: "sticky" as const, x: 530, y: 280, content: "Follow-ups" },
      { type: "taskList" as const, x: 100, y: 430, title: "Action Items" },
    ],
  },
  {
    id: "study-research",
    name: "Study & Research",
    description: "Code snippets, link cards, and notes for learning",
    icon: "📚",
    widgets: [
      { type: "notepad" as const, x: 100, y: 100, width: 350, height: 250, content: "# Research Notes\n\nKey findings..." },
      { type: "codeSnippet" as const, x: 480, y: 100 },
      { type: "linkCard" as const, x: 100, y: 380, title: "Reference", url: "https://example.com" },
      { type: "linkCard" as const, x: 350, y: 380, title: "Documentation", url: "https://example.com" },
      { type: "sticky" as const, x: 600, y: 380, content: "Important concept" },
    ],
  },
  {
    id: "daily-standup",
    name: "Daily Standup",
    description: "Day planner, task list, and focus widget for daily workflow",
    icon: "☀️",
    widgets: [
      { type: "dayPlanner" as const, x: 100, y: 100, numDays: 5 },
      { type: "focus" as const, x: 690, y: 100, title: "Today's Focus" },
      { type: "taskList" as const, x: 690, y: 310, title: "Blockers" },
      { type: "notepad" as const, x: 100, y: 490, width: 300, content: "## Daily Notes" },
    ],
  },
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Grid of sticky notes for idea generation",
    icon: "💡",
    widgets: [
      { type: "sticky" as const, x: 100, y: 100, content: "Idea 1" },
      { type: "sticky" as const, x: 330, y: 100, content: "Idea 2" },
      { type: "sticky" as const, x: 560, y: 100, content: "Idea 3" },
      { type: "sticky" as const, x: 100, y: 280, content: "Idea 4" },
      { type: "sticky" as const, x: 330, y: 280, content: "Idea 5" },
      { type: "sticky" as const, x: 560, y: 280, content: "Idea 6" },
      { type: "notepad" as const, x: 100, y: 460, width: 660, height: 200, content: "## Summary" },
    ],
  },
  {
    id: "project-overview",
    name: "Project Overview",
    description: "Complete project layout with tasks, timeline, and notes",
    icon: "🎯",
    widgets: [
      { type: "notepad" as const, x: 100, y: 100, width: 400, content: "# Project Title\n\n**Status:** In Progress\n\n## Overview\n..." },
      { type: "taskList" as const, x: 530, y: 100, title: "Milestones" },
      { type: "calendar" as const, x: 100, y: 380 },
      { type: "focus" as const, x: 370, y: 380, title: "Current Sprint" },
      { type: "linkCard" as const, x: 100, y: 670, title: "Project Repo", url: "https://github.com" },
    ],
  },
];

export function TemplatesDialog({ isOpen, onClose }: TemplatesDialogProps) {
  const viewport = useBoardStore((s) => s.viewport);
  const widgets = useBoardStore((s) => s.widgets);
  const setWidgets = useBoardStore.setState;

  if (!isOpen) return null;

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    // Calculate starting position based on viewport
    const startX = (-viewport.x + 100) / viewport.zoom;
    const startY = (-viewport.y + 100) / viewport.zoom;

    const maxZ = widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
    const newWidgets: Widget[] = [];
    let zIndex = maxZ + 1;

    // Create all widgets from template
    template.widgets.forEach((w) => {
      const id = nanoid();
      const x = startX + w.x;
      const y = startY + w.y;
      const base = { id, x, y, zIndex: zIndex++, locked: false, createdAt: Date.now() };

      switch (w.type) {
        case "sticky":
          newWidgets.push({
            ...base,
            type: "sticky",
            width: 200,
            height: 150,
            content: ("content" in w ? w.content : undefined) || "",
            color: STICKY_COLORS[0].value,
          });
          break;
        case "notepad": {
          const now = new Date();
          newWidgets.push({
            ...base,
            type: "notepad",
            width: ("width" in w ? w.width : undefined) || 320,
            height: ("height" in w ? w.height : undefined) || 240,
            content: ("content" in w ? w.content : undefined) || "",
            markdown: true,
          });
          break;
        }
        case "taskList":
          newWidgets.push({
            ...base,
            type: "taskList",
            width: 250,
            height: 200,
            title: ("title" in w ? w.title : undefined) || "Tasks",
            items: [],
          });
          break;
        case "calendar": {
          const now = new Date();
          newWidgets.push({
            ...base,
            type: "calendar",
            width: 240,
            height: 260,
            month: now.getMonth(),
            year: now.getFullYear(),
          });
          break;
        }
        case "focus":
          newWidgets.push({
            ...base,
            type: "focus",
            width: 260,
            height: 180,
            title: ("title" in w ? w.title : undefined) || "Focus",
            items: [],
          });
          break;
        case "dayPlanner": {
          const d = new Date();
          const startDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
          newWidgets.push({
            ...base,
            type: "dayPlanner",
            width: 560,
            height: 360,
            startDate,
            numDays: ("numDays" in w ? w.numDays : undefined) || 5,
            tasksByDate: {},
          });
          break;
        }
        case "codeSnippet":
          newWidgets.push({
            ...base,
            type: "codeSnippet",
            width: 300,
            height: 200,
            content: "",
            language: "javascript",
          });
          break;
        case "linkCard":
          newWidgets.push({
            ...base,
            type: "linkCard",
            width: 220,
            height: 80,
            title: ("title" in w ? w.title : undefined) || "",
            url: ("url" in w ? w.url : undefined) || "",
          });
          break;
      }
    });

    // Add all new widgets to the board
    setWidgets({ widgets: [...widgets, ...newWidgets] });

    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1f26] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] mx-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Board Templates
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="flex flex-col items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700
                  hover:border-blue-500 dark:hover:border-blue-500
                  hover:bg-blue-50 dark:hover:bg-blue-900/10
                  transition-all duration-200 text-left group"
              >
                <div className="text-3xl">{template.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {template.widgets.length} widgets
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
