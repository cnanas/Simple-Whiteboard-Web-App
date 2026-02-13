export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
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
