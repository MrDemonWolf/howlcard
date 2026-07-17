// Shared SVG helpers, ported verbatim from mrdemonwolf/website
// apps/website/src/og/render.ts (see that repo's docs/handoff-og-image-tool.md).
import type { Theme } from "./theme";

export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Naive monospace-ish wrap. Titles are short; long ones wrap to 2 lines then
// truncate with an ellipsis so the bottom panel never overflows.
// ponytail: char-count wrap, good enough at 50px DM Sans. Swap for real text
// measurement only if a title visibly clips.
export function wrapTitle(text: string, maxChars = 38, maxLines = 2): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    const used = lines.join(" ").length;
    if (used < text.replace(/\s+/g, " ").length) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] =
        last.length > maxChars - 1 ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
    }
  }
  return lines;
}

// Pill chip sized to its label (approx DM Sans 600 @ 26px advance).
export function chip(
  label: string,
  x: number,
  y: number,
  theme: Theme,
  anchor: "start" | "end" = "start",
): string {
  const text = esc(label);
  const w = Math.max(120, Math.round(label.length * 15 + 44));
  const rx = anchor === "end" ? x - w : x;
  const cx = rx + w / 2;
  return (
    `<rect x="${rx}" y="${y}" width="${w}" height="52" rx="26" fill="${theme.accent}"/>` +
    `<text x="${cx}" y="${y + 35}" text-anchor="middle" font-family="DM Sans" font-size="26" font-weight="600" fill="${theme.chipText}">${text}</text>`
  );
}

export function titleLines(lines: string[], x: number, lastBaseline: number, theme: Theme): string {
  const lh = 56;
  const start = lastBaseline - (lines.length - 1) * lh;
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${start + i * lh}" font-family="DM Sans" font-size="50" font-weight="600" fill="${theme.text}">${esc(l)}</text>`,
    )
    .join("");
}

// The wolf head mark used across templates.
export const WOLF_PATH =
  "M80 148 L48 122 L34 92 L22 58 L46 52 L24 14 L62 46 L80 38 L98 46 L136 14 L114 52 L138 58 L126 92 L112 122 Z";

export function wolfBadge(theme: Theme): string {
  return (
    `<g id="mk"><rect width="44" height="44" rx="9" fill="${theme.accent}"/>` +
    `<path d="M22 38 L12 22 L9 11 L18 16 L22 13 L26 16 L35 11 L32 22 Z" fill="${theme.text}"/>` +
    `<circle cx="17" cy="23" r="1.8" fill="${theme.bg}"/><circle cx="27" cy="23" r="1.8" fill="${theme.bg}"/></g>`
  );
}
