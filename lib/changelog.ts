export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "2026-02-13",
    changes: [
      "Markdown support: Enable markdown rendering in sticky notes and notepads with toggle button",
      "Alignment tools: Align and distribute multiple selected widgets (left/right/top/bottom/center, horizontal/vertical distribution)",
      "Multi-delete: Delete multiple selected widgets at once with Delete or Backspace key",
      "Markdown import: Paste markdown text to auto-create widgets (headings → sticky notes, paragraphs → notepads, code blocks → code snippets, task lists → task widgets)",
      "Board templates: 6 pre-built layouts (Sprint Planning, Meeting Notes, Study & Research, Daily Standup, Brainstorming, Project Overview)",
      "Real-time collaboration: Share boards with live cursors, presence avatars, and concurrent editing via Liveblocks",
      "Enhanced search: Filter by color, sort by type/date/position, focus on widget from search results with pulse animation",
      "Improved UX: Labeled quick actions in bottom bar, removed mobile header for cleaner interface, better widget spacing in templates, fixed user menu positioning",
      "Auto-save: All changes automatically save to cloud every 2 seconds when signed in",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-12",
    changes: [
      "Infinite canvas with pan and zoom (trackpad and mouse)",
      "Widgets: sticky notes, notepad, task list, sticker, calendar, link card, focus, code snippet, day planner",
      "Customizable bottom bar: quick-add icons, hold to reorder, settings (export, list view, sign in, theme)",
      "Sign in with GitHub, Apple, or email — save and load board from cloud",
      "Export board as TXT or PDF",
      "List view and canvas view",
      "First-time splash and optional tutorial",
      "PWA support",
    ],
  },
];
