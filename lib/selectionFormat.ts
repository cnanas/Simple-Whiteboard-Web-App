/**
 * Apply markdown-style formatting to a text selection.
 * Returns the new content and the new selection [start, end] so the editor can restore cursor.
 */
export type SelectionFormatType = "bold" | "italic" | "bullet" | "number";

export interface FormatResult {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

export function applyFormatToSelection(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: SelectionFormatType
): FormatResult {
  if (format === "bold") {
    const before = content.slice(0, selectionStart);
    const selected = content.slice(selectionStart, selectionEnd);
    const after = content.slice(selectionEnd);
    const newContent = before + "**" + selected + "**" + after;
    const len = selected.length;
    return {
      content: newContent,
      selectionStart: selectionStart + 2,
      selectionEnd: selectionStart + 2 + len,
    };
  }

  if (format === "italic") {
    const before = content.slice(0, selectionStart);
    const selected = content.slice(selectionStart, selectionEnd);
    const after = content.slice(selectionEnd);
    const newContent = before + "*" + selected + "*" + after;
    const len = selected.length;
    return {
      content: newContent,
      selectionStart: selectionStart + 1,
      selectionEnd: selectionStart + 1 + len,
    };
  }

  if (format === "bullet" || format === "number") {
    const lines = content.split("\n");
    let charIndex = 0;
    let startLineIdx = 0;
    let endLineIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + (i < lines.length - 1 ? 1 : 0);
      if (charIndex <= selectionStart && selectionStart <= charIndex + lineLen) {
        startLineIdx = i;
      }
      if (charIndex <= selectionEnd && selectionEnd <= charIndex + lineLen) {
        endLineIdx = i;
        break;
      }
      charIndex += lineLen;
    }

    const newLines = lines.map((line, i) => {
      if (i >= startLineIdx && i <= endLineIdx) {
        const trimmed = line.trimStart();
        if (format === "number") {
          return `${i - startLineIdx + 1}. ${trimmed}`;
        }
        return trimmed ? `- ${trimmed}` : line;
      }
      return line;
    });

    const newContent = newLines.join("\n");
    let newSelStart = 0;
    for (let i = 0; i < startLineIdx; i++) newSelStart += newLines[i].length + 1;
    let newSelEnd = newSelStart;
    for (let i = startLineIdx; i <= endLineIdx; i++) newSelEnd += newLines[i].length + (i < endLineIdx ? 1 : 0);

    return {
      content: newContent,
      selectionStart: newSelStart,
      selectionEnd: newSelEnd,
    };
  }

  return { content, selectionStart, selectionEnd };
}
