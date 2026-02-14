import type { TextStyle, FontSizeOption, ListStyleOption } from "@/types";
import { DEFAULT_TEXT_STYLE } from "@/types";

export function mergeWithDefault(style?: TextStyle | null): Required<TextStyle> {
  return {
    bold: style?.bold ?? DEFAULT_TEXT_STYLE.bold ?? false,
    italic: style?.italic ?? DEFAULT_TEXT_STYLE.italic ?? false,
    fontSize: style?.fontSize ?? DEFAULT_TEXT_STYLE.fontSize ?? "base",
    listStyle: style?.listStyle ?? DEFAULT_TEXT_STYLE.listStyle ?? "none",
  };
}

const FONT_SIZE_CLASSES: Record<FontSizeOption, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  base: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/** Tailwind classes for a container that displays text with the given style */
export function getTextStyleClassName(style?: TextStyle | null): string {
  const s = mergeWithDefault(style);
  const parts = [
    FONT_SIZE_CLASSES[s.fontSize],
    s.bold ? "font-bold" : "font-normal",
    s.italic ? "italic" : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/** Whether to render content as a list (bullet or number) */
export function getListStyle(style?: TextStyle | null): ListStyleOption {
  return style?.listStyle ?? "none";
}
