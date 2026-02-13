# Whiteboarding App — Plan & Recommendations

## Recommendation: **Next.js Webapp**

For your goals (open space, locked items, easy sharing), a **Next.js webapp** is the better fit:

| Factor | Next.js Webapp | macOS App |
|--------|----------------|-----------|
| **Reach** | Any device with a browser | Mac only |
| **Sharing** | Share link + export PDF/TXT | File-based only; no “share link” |
| **Collaboration** | Can add real-time later | Harder |
| **Distribution** | Deploy once, everyone uses same URL | App Store or direct download |
| **Locked items** | Client-side encryption + password | Native Keychain possible, but more setup |
| **Speed to ship** | Faster with React + canvas/SVG libs | Swift/AppKit or SwiftUI + more plumbing |
| **Offline** | Possible via PWA + local storage | Native offline |

**Verdict:** Build the **Next.js webapp** first. You get open space, locks, and sharing without platform lock-in. You can later wrap it in Electron/Capacitor if you want a “desktop app” feel.

---

## Core Concept: "Open Space" Whiteboard

- **Infinite or large canvas** — pan and zoom; everything is positioned in 2D space.
- **Widgets** — each widget type lives in one system:
  - **Sticky notes** — text, color, optional due date
  - **Calendar** — small calendar view (or link to external)
  - **Notepad** — larger text block
  - **Stickers** — images or emoji-style decorations
- **Free placement** — every widget has `(x, y)` (and optionally `zIndex`). Users drag to move.
- **Locked widgets** — some widgets can be “locked”; content is encrypted and only viewable after entering a password.

---

## Mobile Strategy

Same app, one codebase — but mobile needs different UX so the canvas doesn’t feel cramped. Here are concrete options.

### Option A — Same canvas, touch-optimized (recommended to start)
- **One infinite canvas** on all devices; no separate “mobile layout.”
- **Touch:** Pinch to zoom, two-finger pan (or drag-with-second-finger to pan). Single-finger drag = move widget. Long-press on widget = context menu (edit, lock, delete).
- **Editing:** Tapping a widget opens a **bottom sheet** (or full-screen modal on small phones) for content. Keyboard and big tap targets; no tiny inline edits on the canvas.
- **Add widget:** Floating action button (FAB) or bottom nav “+” that opens a widget picker (sticky, notepad, calendar, etc.).
- **Pros:** One mental model; works everywhere. **Cons:** Dense boards on small screens can feel busy until zoomed.

### Option B — Widget list + canvas
- **Mobile:** Default view = **list of widgets** (cards with title/preview). Tap a card to open that widget full-screen to view/edit. Optional “Map view” to see the canvas.
- **Desktop:** Full canvas as today.
- **Pros:** Mobile is list-first, easy to scroll and tap. **Cons:** Two modes to build and maintain; “open space” is secondary on mobile.

### Option C — Simplified mobile canvas
- **Mobile:** Canvas shows **larger minimum widget size** and a **snap-to-grid** so widgets don’t overlap. Toolbar collapses to icons; “add” is a FAB.
- **Desktop:** Free placement, no grid required.
- **Pros:** Still one canvas, less chaos on small screens. **Cons:** Slightly different behavior by breakpoint.

**Recommendation:** Start with **Option A** (same canvas, touch-optimized). Use a bottom sheet for editing, FAB for add, and proper touch handlers (pinch, pan, long-press). Add Option B’s “widget list” view later as an alternative mobile entry point if users want it.

---

## iPad & Apple Pencil (Browser)

The app runs in **Safari (or any browser) on iPad** with no separate build. A few tweaks make it iPad- and Pencil-friendly.

### iPad in the browser
- **Same app:** One responsive layout. On iPad, use a **tablet breakpoint** (e.g. 768px–1024px): larger tap targets than desktop, but you can show a bit more UI than on phone (e.g. sidebar or toolbar visible instead of hidden in a menu).
- **Touch-first:** All interactions work with finger (pinch zoom, two-finger pan, tap, long-press). No hover-only actions.
- **PWA optional:** Add a **manifest + service worker** so users can “Add to Home Screen” and open the app full-screen like a native app, with no browser chrome.
- **Safe areas:** Respect `env(safe-area-inset-*)` so the layout isn’t clipped by notches or home indicator.

### Apple Pencil support
Safari on iPad exposes the Pencil via the **Pointer Events** API, so the same code can treat it as a precise pointer and, if you add drawing later, use pressure.

- **Pointer type:** Use `pointerType === 'pen'` to detect Apple Pencil (vs `'touch'` or `'mouse'`). You can use this to:
  - **Precise tap:** Pencil tap = same as tap (open widget, select). No accidental “fat finger” hits.
  - **Precise drag:** Pencil drag = move widget or pan canvas, with finer control than finger.
- **Pressure (PointerEvent):** Safari 13+ supports `PointerEvent.pressure` (0–1). Use it when you add **freehand drawing** (e.g. strokes that get thicker with pressure). For Phase 1 (widgets only), pressure is optional; just handling Pencil as a pen pointer is enough.
- **Avoid accidental marks:** Ignore or throttle very short Pencil touches so a quick tap doesn’t start a draw. Optionally: “Draw” mode only when user explicitly enables a pencil/draw tool.
- **Implementation:** Prefer **Pointer Events** (`pointerdown`, `pointermove`, `pointerup`) over touch-only so one path works for finger, Pencil, and mouse. React Flow and most canvas libs use or can use pointer events.

### Summary
- **iPad:** Same app in browser; tablet breakpoint, touch-first, optional PWA “Add to Home Screen,” safe areas.
- **Apple Pencil:** Use Pointer Events; treat `pointerType === 'pen'` for precise tap and drag; add pressure-based drawing later if you add a freehand/drawing mode.

---

## Canvas Library Recommendation

You need: infinite (or large) pannable/zoomable canvas, draggable/resizable widgets, good **touch support**, and a **modern look**. Comparison:

| Library | Best for | Mobile touch | Custom widgets | Vibe |
|--------|----------|--------------|----------------|------|
| **React Flow** | Node-based UIs (widgets = nodes) | Good (official touch example) | Custom node components | Clean, diagram-like |
| **Tldraw** | Full whiteboard (draw + shapes + embeds) | Built for it | Custom shapes/tools | Polished, “Figma-like” |
| **Konva** | Pixel-level canvas control | Excellent | You build everything | Flexible, game-like |
| **Fabric.js** | Drawing + objects on canvas | Good | You build everything | Classic canvas |

- **React Flow** — Fastest path to “widgets on a board”: nodes are your stickies, notepads, calendars. Pan/zoom built in; you style nodes to look modern. Fits a Sunsama-like “cards on a space” product. **Best fit for your scope** (widgets, not freehand drawing).
- **Tldraw** — Use if you want drawing, arrows, and a very polished infinite canvas; you’d add custom shapes for “sticky,” “notepad,” “calendar” and wire lock/export. More work for your custom logic.
- **Konva** — Use if you want full control and might add heavy custom interactions or animations; more code for pan/zoom and layout.

**Recommendation:** **React Flow** for the first version. It gives you a modern, node-based canvas with touch support and lets you ship quickly. If later you want freehand drawing and a more “whiteboard” feel, you can evaluate Tldraw or a Konva layer.

---

## Modern & Techy Visual Direction

To make it feel **modern and techy** (without “AI slop”):

- **Theme:** **Light mode first** (default) — clean off-white/light gray canvas (`#f8fafc`–`#f1f5f9`) and subtle grid or dot pattern. **Dark mode is a priority:** full dark theme (charcoal/slate `#0f1419`–`#1a1f26`) with the same layout; respect `prefers-color-scheme` and provide a manual toggle so dark is always one tap away and feels first-class.
- **Widgets:** Slight **glassmorphism** (backdrop-blur, semi-transparent fills) or **solid cards** with a thin border and soft shadow. Rounded corners (e.g. `12px`), no heavy skeuomorphism.
- **Typography:** One clean sans (e.g. **Geist**, **JetBrains Mono** for timestamps/code, or **Plus Jakarta Sans**). Clear hierarchy: title vs body vs metadata.
- **Color:** One **accent** (e.g. electric blue `#3b82f6` or cyan `#06b6d4`) for primary actions, selection, and links. Sticky colors stay muted so the board doesn’t look like candy.
- **Motion:** Short transitions (150–200ms) on add/remove/move widgets; optional subtle “float” or parallax on the canvas. No long flashy animations.
- **Canvas:** Pan/zoom feel smooth (React Flow handles this); optional **minimap** in a corner for large boards.

This keeps the product feeling product-y and “tool” rather than playful or childish.

---
wd
## Widget Recommendations (Including Sunsama-Inspired)

You already have: **sticky notes**, **calendar**, **notepad**, **stickers**. Sunsama focuses on daily planning, timeboxing, and task–calendar connection. Below are widgets that fit that vibe and a general open space.

### Core (from original plan)
- **Sticky note** — Text, color, optional due date; compact.
- **Notepad** — Multi-line text, resizable; for longer notes.
- **Calendar** — Month or week strip; optional: tap date to add a small “day note” or link to a daily section.
- **Sticker** — Image or emoji; decorative or mood.

### Sunsama-style / planning
- **Task list** — Checklist with due dates and optional time estimate (e.g. “30 min”). Can later support “add to calendar” or time block (when you add calendar integration).
- **Today / focus** — Single widget that shows “Today’s focus” or 3–5 key items; could pull from task list or be manual. Good anchor for a daily ritual.
- **Time block strip** — Simple horizontal “day” with blocks (e.g. 8–12, 12–1, 1–5); drag tasks onto blocks. Lighter than full calendar but very Sunsama-like.
- **Goals / objectives** — Short list of weekly or monthly goals; text only or with progress (e.g. 2/5 done).

### Practical / techy
- **Link card** — Title + URL; opens in new tab. Good for references and docs.
- **Code snippet** — Monospace block with optional language label; lockable.
- **Quick capture** — One-line input that creates a sticky or task when you press Enter; then clears. “Inbox” style.

### Nice-to-have later
- **Countdown** — To a date/time (e.g. “Launch” or “Trip”).
- **Mood / rating** — Simple 1–5 or emoji for daily check-in.
- **Image** — Upload or paste; can be locked.

**Suggested order:** Ship **sticky**, **notepad**, **calendar**, **task list**, **stickers** first. Add **Today/focus**, **link card**, and **time block strip** in the next wave so it feels Sunsama-adjacent without building a full calendar sync yet.

---

## Feature Summary

1. **Canvas**
   - Pan (e.g. drag background) and zoom (wheel or pinch).
   - Infinite or very large board (e.g. 10000×10000 px or virtual units).

2. **Widgets**
   - Sticky notes, calendar, notepad, stickers.
   - Drag to move; resize where it makes sense (e.g. notepad, big sticky).
   - Optional: rotate, duplicate, delete.

3. **Locked items**
   - Per-widget “Lock” toggle.
   - On lock: encrypt content with user-chosen password (e.g. AES in browser).
   - On unlock: prompt for password; decrypt and show content.
   - Locked state: show placeholder (e.g. “Locked” icon) and no content until unlocked.

4. **Sharing**
   - **PDF** — render visible (unlocked) widgets to a page and use browser print → PDF or a lib (e.g. jsPDF + html2canvas, or server-side Puppeteer).
   - **TXT** — extract text from unlocked widgets in a defined order (e.g. by position) and download as `.txt`.

---

## Suggested Tech Stack (Next.js)

- **Framework:** Next.js 14+ (App Router).
- **Canvas:** [React Flow](https://reactflow.dev/) — nodes as widgets, pan/zoom, touch support. Primary recommendation.
- **Styling:** Tailwind CSS; **light default**, **dark mode priority** (toggle + optional `prefers-color-scheme`); optional glassmorphism. Fonts: Geist or Plus Jakarta Sans (+ JetBrains Mono for code).
- **State:** Zustand (or React state) for board + widgets; React Flow’s store for viewport.
- **Persistence:** localStorage or IndexedDB (e.g. [Dexie](https://dexie.org/)); no backend for v1.
- **Encryption (locked items):** [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (AES-GCM), key from password via PBKDF2.
- **Export:** PDF via jsPDF + html2canvas or react-to-print; TXT = concatenate text from unlocked widgets, download.
- **Bottom sheet / drawer (mobile widget edit):** Prefer a maintained option. **[Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)** styled as a bottom sheet (fixed to bottom, slide-up animation, full-width on small screens) — no extra dependency, fully maintained. Alternatives: **[@vladyoslav/drawer](https://www.npmjs.com/package/@vladyoslav/drawer)** (Radix-based, Vaul-inspired, draggable) or **[open-sesame](https://github.com/jordan-sussman/open-sesame)** (Radix Dialog + framer-motion, multi-direction). Avoid Vaul (unmaintained).
- **Mobile & iPad:** Touch handlers (pinch/pan) from React Flow; bottom sheet for widget edit (see **Bottom sheet / drawer** above); FAB for “add widget.” **iPad:** tablet breakpoint, safe areas; **Apple Pencil:** use Pointer Events (`pointerType === 'pen'`) for precise tap/drag; optional pressure later for drawing.

---

## Data Model (Sketch)

```ts
// Types you'll need
interface Board {
  id: string;
  name?: string;
  widgets: Widget[];
  viewport: { x: number; y: number; zoom: number };
}

type WidgetType =
  | 'sticky'
  | 'calendar'
  | 'notepad'
  | 'sticker'
  | 'taskList'
  | 'focus'      // Today / focus
  | 'linkCard'
  | 'codeSnippet'
  | 'timeBlock'; // optional, later

interface WidgetBase {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  encryptedContent?: string;  // when locked, store ciphertext only
}

interface StickyWidget extends WidgetBase {
  type: 'sticky';
  content: string;      // when unlocked
  color: string;
  dueDate?: string;
}

interface NotepadWidget extends WidgetBase {
  type: 'notepad';
  content: string;
}

interface TaskListWidget extends WidgetBase {
  type: 'taskList';
  title?: string;
  items: { id: string; text: string; done: boolean; due?: string; estimate?: number }[];
}

interface FocusWidget extends WidgetBase {
  type: 'focus';
  title?: string;   // e.g. "Today"
  items: string[];  // 3–5 focus items
}

interface LinkCardWidget extends WidgetBase {
  type: 'linkCard';
  title: string;
  url: string;
}

interface CodeSnippetWidget extends WidgetBase {
  type: 'codeSnippet';
  language?: string;
  content: string;
}

// ... calendar, sticker variants
```

- **Locked:** When user locks, you encrypt `content` with password-derived key, set `encryptedContent`, clear `content` from persisted storage. When they unlock, decrypt into `content` and show it.

---

## Phased Roadmap

### Phase 1 — Minimal board (1–2 weeks)
- Next.js app with one page: **React Flow** canvas, pan/zoom, touch-friendly.
- Single widget type: **sticky note** (drag to move, edit text, color).
- Save/load board from localStorage (or IndexedDB).
- **Theme:** Light mode as default; dark mode as priority (toggle + optional system preference; both themes polished).
- No auth; single-user per browser.

### Phase 2 — More widgets & layout (1–2 weeks)
- Add **notepad**, **task list**, **stickers**, and **calendar**.
- Resize for notepad (and maybe large stickies).
- **Mobile:** Bottom sheet for editing widgets; FAB for “add widget.”
- Clear “add widget” menu and basic styling.

### Phase 3 — Locked items (≈1 week)
- “Lock” toggle per widget.
- Password prompt; encrypt/decrypt content with Web Crypto; store only `encryptedContent` when locked.
- Placeholder view when locked.

### Phase 4 — Sharing (≈1 week)
- **Export as TXT:** collect text from unlocked widgets (e.g. by position top→bottom, left→right), download file.
- **Export as PDF:** render visible unlocked widgets to a printable view or image, then PDF (client-side or API route).

### Phase 5 — Polish & optional cloud
- **Widget list view** (optional mobile entry: list of widgets, tap to open).
- **PWA** (offline, “Add to home screen” — especially nice on iPad for a full-screen app feel).
- **iPad + Apple Pencil:** Ensure pointer events and tablet layout are polished; add pressure-based freehand drawing only if you add a draw tool.
- Optional: backend + auth, sync boards across devices, share read-only links.

---

## If You Chose macOS Instead

- **Stack:** SwiftUI + Canvas or AppKit with custom NSView.
- **Storage:** SwiftData or Core Data; files on disk.
- **Encryption:** CryptoKit for AES-GCM; password → key with PBKDF2.
- **Sharing:** Export to PDF/RTF (and TXT) via system APIs; “share” = send file (Mail, Messages, etc.).
- **Trade-off:** More effort for one platform and no “share a link” without a separate backend.

---

## Next Steps

1. **Scaffold:** `npx create-next-app@latest` with TypeScript, Tailwind, App Router.
2. **Phase 1:** React Flow canvas (touch-friendly) + one sticky widget + drag + localStorage + light default theme with dark mode priority.
3. **Phase 2:** Notepad, task list, calendar, stickers; mobile bottom sheet + FAB.
4. **Iterate:** Locked items → PDF/TXT export → extra widgets (focus, link card, time block).

When you’re ready to build, we can generate the project, core types, and a minimal canvas + sticky so you have a running open space to extend.
