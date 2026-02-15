import type { Widget } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Sort widgets top-to-bottom, then left-to-right */
export function getUnlockedSorted(widgets: Widget[]): Widget[] {
  const unlocked = widgets.filter((w) => !w.locked);
  return [...unlocked].sort((a, b) => {
    const rowA = Math.floor(a.y / 100);
    const rowB = Math.floor(b.y / 100);
    if (rowA !== rowB) return rowA - rowB;
    return a.x - b.x;
  });
}

function widgetToText(widget: Widget): string {
  switch (widget.type) {
    case "sticky":
      return widget.content || "";
    case "notepad":
      return widget.content || "";
    case "taskList": {
      const lines = widget.title ? [`## ${widget.title}`] : [];
      for (const item of widget.items) {
        const duePart = item.due ? ` (due: ${item.due})` : "";
        const estPart = item.estimate != null ? ` [${item.estimate} min]` : "";
        lines.push(`${item.done ? "[x]" : "[ ]"} ${item.text}${duePart}${estPart}`);
      }
      return lines.join("\n");
    }
    case "sticker":
      return widget.emoji ? `Sticker: ${widget.emoji}` : "";
    case "calendar":
      return `Calendar: ${MONTH_NAMES[widget.month]} ${widget.year}`;
    case "linkCard":
      return [widget.title, widget.url].filter(Boolean).join("\n") || "";
    case "focus":
      return [widget.title, ...widget.items].filter(Boolean).join("\n") || "";
    case "codeSnippet":
      return widget.content || "";
    case "dayPlanner": {
      const lines: string[] = [];
      const dates = Object.keys(widget.tasksByDate || {}).sort();
      for (const dateKey of dates) {
        const tasks = (widget.tasksByDate || {})[dateKey] || [];
        if (tasks.length === 0) continue;
        lines.push(`${dateKey}:`);
        for (const t of tasks) {
          lines.push(`  ${t.done ? "[x]" : "[ ]"} ${t.text}${t.scheduledTime ? ` @ ${t.scheduledTime}` : ""}`);
          for (const sub of t.subTasks || []) {
            lines.push(`    ${sub.done ? "[x]" : "[ ]"} ${sub.text}`);
          }
        }
      }
      return lines.join("\n");
    }
    default:
      return "";
  }
}

/** Build full TXT content from unlocked widgets (sorted by position) */
export function buildTxtContent(widgets: Widget[]): string {
  const sorted = getUnlockedSorted(widgets);
  const parts = sorted.map((w) => {
    const text = widgetToText(w);
    if (!text.trim()) return null;
    const label = w.type.charAt(0).toUpperCase() + w.type.slice(1);
    return `--- ${label} ---\n${text}`;
  });
  return parts.filter(Boolean).join("\n\n");
}

/** Trigger download of board content as a .txt file */
export function exportToTxt(widgets: Widget[], filename = "whiteboard-export.txt"): void {
  const content = buildTxtContent(widgets);
  const blob = new Blob([content || "No content to export."], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build HTML string for the printable PDF view (unlocked widgets only) */
function buildPrintHtml(widgets: Widget[]): string {
  const sorted = getUnlockedSorted(widgets);
  const cards = sorted.map((w) => {
    const text = widgetToText(w).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    const label = w.type.charAt(0).toUpperCase() + w.type.slice(1);
    return `
      <div class="card" style="
        background:#fff; border:1px solid #e5e7eb; border-radius:12px;
        padding:14px 16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08);
        font-family:system-ui,-apple-system,sans-serif; font-size:14px; color:#1f2937;
      ">
        <div style="font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">${label}</div>
        <div style="white-space:pre-wrap; line-height:1.5;">${text || "—"}</div>
      </div>`;
  });
  return `
    <div id="pdf-export-root" style="
      position:fixed; left:-9999px; top:0; width:800px;
      padding:24px; background:#f8fafc; font-family:system-ui,sans-serif;
    ">
      <h1 style="font-size:18px; font-weight:600; color:#111; margin-bottom:20px;">Whiteboard Export</h1>
      ${cards.join("")}
    </div>`;
}

/** Export unlocked widgets as PDF (client-side) */
export async function exportToPdf(widgets: Widget[], filename = "whiteboard-export.pdf"): Promise<void> {
  const sorted = getUnlockedSorted(widgets);
  if (sorted.length === 0) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("No content to export.", 20, 30);
    doc.save(filename);
    return;
  }

  const container = document.createElement("div");
  container.innerHTML = buildPrintHtml(widgets);
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#f8fafc";
  document.body.appendChild(container);

  const root = container.querySelector("#pdf-export-root") as HTMLElement;
  if (!root) {
    document.body.removeChild(container);
    return;
  }

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#f8fafc",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = Math.min(pageW / imgW, pageH / imgH) * 25.4 / 96; // px to mm at 96dpi, then scale to fit
    const w = imgW * ratio;
    const h = imgH * ratio;
    const x = (pageW - w) / 2;
    const y = 10;

    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
