/**
 * Convert HTML table (from clipboard) to GFM markdown table.
 * Returns null if the HTML does not contain a table.
 */
export function htmlTableToMarkdown(html: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;

  const rows = Array.from(table.querySelectorAll("tr"));
  const cells = rows.map((tr) =>
    Array.from(tr.querySelectorAll("th, td")).map((cell) =>
      (cell.textContent ?? "").trim().replace(/\n+/g, " ")
    )
  );
  if (cells.length === 0) return null;

  const colCount = Math.max(...cells.map((r) => r.length), 1);
  const pad = (arr: string[]): string[] => {
    const a = [...arr];
    while (a.length < colCount) a.push("");
    return a;
  };
  const normalized = cells.map((r) => pad(r));

  // Escape pipes and backslashes for markdown
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");

  const header = normalized[0].map(escape);
  const separator = header.map(() => "---");
  const body = normalized.slice(1).map((row) => row.map(escape));

  const lines = [
    "| " + header.join(" | ") + " |",
    "| " + separator.join(" | ") + " |",
    ...body.map((row) => "| " + row.join(" | ") + " |"),
  ];
  return lines.join("\n");
}

/**
 * Convert plain text table (tab or pipe-separated rows) to GFM markdown table.
 * Returns null if the text doesn't look like a table (e.g. no tabs and no pipe rows).
 */
export function plainTextTableToMarkdown(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const hasTabs = lines.some((l) => l.includes("\t"));
  const hasPipes = lines.some((l) => l.includes("|"));
  const separator = hasTabs ? "\t" : "|";
  const cells = lines.map((line) => {
    const parts = hasTabs
      ? line.split("\t").map((c) => c.trim())
      : line
          .split("|")
          .map((c) => c.trim())
          .filter((_, i, arr) => (hasPipes && arr.length > 1 ? true : c.length > 0));
    return parts;
  });
  const colCount = Math.max(...cells.map((r) => r.length), 1);
  const pad = (arr: string[]): string[] => {
    const a = [...arr];
    while (a.length < colCount) a.push("");
    return a;
  };
  const normalized = cells.map((r) => pad(r));
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
  const header = normalized[0].map(escape);
  const sep = header.map(() => "---");
  const body = normalized.slice(1).map((row) => row.map(escape));
  const linesOut = [
    "| " + header.join(" | ") + " |",
    "| " + sep.join(" | ") + " |",
    ...body.map((row) => "| " + row.join(" | ") + " |"),
  ];
  return linesOut.join("\n");
}

/**
 * Default markdown table template (e.g. 3x3) for "Insert table".
 */
export function getDefaultMarkdownTable(rows = 3, cols = 3): string {
  const header = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`).join(" | ");
  const sep = Array.from({ length: cols }, () => "---").join(" | ");
  const bodyRows = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array.from({ length: cols }, () => "").join(" | ")
  );
  const lines = [
    "| " + header + " |",
    "| " + sep + " |",
    ...bodyRows.map((row) => "| " + row + " |"),
  ];
  return lines.join("\n");
}
