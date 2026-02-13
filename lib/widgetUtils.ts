import type { Widget } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getWidgetTypeLabel(type: Widget["type"]): string {
  const labels: Record<Widget["type"], string> = {
    sticky: "Sticky Note",
    notepad: "Notepad",
    taskList: "Task List",
    sticker: "Sticker",
    calendar: "Calendar",
    linkCard: "Link",
    focus: "Today / Focus",
    codeSnippet: "Code Snippet",
    dayPlanner: "Day planner",
  };
  return labels[type];
}

/** First line or short preview for list view cards */
export function getWidgetPreview(widget: Widget): string {
  switch (widget.type) {
    case "sticky":
      return (widget.content || "Empty note").split("\n")[0].slice(0, 60) || "Empty note";
    case "notepad":
      return (widget.content || "Empty notepad").split("\n")[0].slice(0, 60) || "Empty notepad";
    case "taskList": {
      const title = widget.title || "Tasks";
      const count = widget.items.length;
      return count ? `${title} (${widget.items.filter((i) => i.done).length}/${count})` : title;
    }
    case "sticker":
      return widget.emoji || "Sticker";
    case "calendar":
      return `${MONTH_NAMES[widget.month]} ${widget.year}`;
    case "linkCard":
      return (widget.title || widget.url || "Link").slice(0, 50) || "Link";
    case "focus":
      return widget.items.length ? `${widget.title || "Today"} (${widget.items.length})` : (widget.title || "Today");
    case "codeSnippet":
      return (widget.content || "Code").split("\n")[0].slice(0, 50) || "Code";
    case "dayPlanner": {
      const total = Object.values(widget.tasksByDate || {}).flat().length;
      return total ? `${widget.numDays} days, ${total} tasks` : "Day planner";
    }
    default:
      return "";
  }
}

/** Sort widgets top-to-bottom, then left-to-right (for list order) */
export function sortWidgetsByPosition(widgets: Widget[]): Widget[] {
  return [...widgets].sort((a, b) => {
    const rowA = Math.floor(a.y / 100);
    const rowB = Math.floor(b.y / 100);
    if (rowA !== rowB) return rowA - rowB;
    return a.x - b.x;
  });
}
