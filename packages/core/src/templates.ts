// The three starter templates, ported pixel-identical (under the default
// theme) from mrdemonwolf/website apps/website/src/og/render.ts. Every
// template is a pure function (opts, theme) => svg string; rasterization
// happens in the app layer, never here.
import type { Theme } from "./theme";
import { esc, wrapTitle, chip, titleLines, WOLF_PATH, wolfBadge } from "./svg";

export type TemplateOpts = {
  title?: string;
  /** blog: category chip. project: tag chip. */
  label?: string;
  /** data: URI or empty; the app layer resolves URLs to data URIs */
  image?: string;
  /** project template eyebrow, defaults to "The build" */
  eyebrow?: string;
};

export type Template = {
  name: string;
  description: string;
  fields: (keyof TemplateOpts)[];
  render: (opts: TemplateOpts, theme: Theme) => string;
};

const FRAME = `<clipPath id="frame"><rect x="0" y="0" width="1200" height="630"/></clipPath>`;

function renderDefault(_opts: TemplateOpts, t: Theme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <path id="wpath" d="${WOLF_PATH}" fill="${t.accent}"/>
    ${FRAME}
  </defs>
  <g clip-path="url(#frame)">
    <rect x="0" y="0" width="1200" height="630" fill="${t.bg}"/>
    <circle cx="1120" cy="314" r="240" fill="none" stroke="${t.accent}" stroke-opacity="0.14" stroke-width="3"/>
    <circle cx="1120" cy="314" r="340" fill="none" stroke="${t.accent}" stroke-opacity="0.10" stroke-width="3"/>
    <circle cx="1120" cy="314" r="440" fill="none" stroke="${t.accent}" stroke-opacity="0.07" stroke-width="3"/>
    <use href="#wpath" transform="translate(860,64) scale(2.9)" opacity="0.18"/>
    <text x="84" y="300" font-family="DM Sans" font-size="84" font-weight="600" fill="${t.text}">${esc(t.brand)}</text>
    <rect x="86" y="322" width="150" height="8" rx="4" fill="${t.accent}"/>
    <text x="86" y="392" font-family="DM Sans" font-size="34" fill="${t.subtext}">${esc(t.tagline)}</text>
    <text x="86" y="548" font-family="JetBrains Mono" font-size="30" fill="${t.accent}">${esc(t.site)}</text>
  </g>
</svg>`;
}

function renderBlog(opts: TemplateOpts, t: Theme): string {
  const img = opts.image || null;
  const lines = wrapTitle(opts.title || "Untitled");
  // Two-line titles need a taller panel + a chip pushed up so they don't collide.
  const two = lines.length > 1;
  const panel = two ? "0,360 1200,300 1200,630 0,630" : "0,448 1200,388 1200,630 0,630";
  const chipY = two ? 392 : 464;
  const bylineY = two ? 590 : 600;
  const titleBaseline = bylineY - 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    ${wolfBadge(t)}
    ${FRAME}
  </defs>
  <g clip-path="url(#frame)">
    <rect x="0" y="0" width="1200" height="630" fill="${img ? t.panel : t.bg}"/>
    ${img ? `<image href="${img}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <polygon points="0,0 184,0 0,184" fill="${t.accent}"/>
    <use href="#mk" transform="translate(1080,36) scale(1.4)"/>
    <polygon points="${panel}" fill="${t.bg}" fill-opacity="0.95"/>
    ${opts.label ? chip(opts.label, 48, chipY, t) : ""}
    ${titleLines(lines, 48, titleBaseline, t)}
    <text x="48" y="${bylineY}" font-family="DM Sans" font-size="26" fill="${t.text}" fill-opacity="0.65">${esc(t.byline)}</text>
  </g>
</svg>`;
}

function renderProject(opts: TemplateOpts, t: Theme): string {
  const img = opts.image || null;
  const lines = wrapTitle(opts.title || "Untitled");
  const bylineY = lines.length > 1 ? 600 : 588;
  const titleBaseline = bylineY - 44;
  const firstBaseline = titleBaseline - (lines.length - 1) * 56;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    ${FRAME}
  </defs>
  <g clip-path="url(#frame)">
    <rect x="0" y="0" width="1200" height="630" fill="${img ? t.panel : t.bg}"/>
    ${img ? `<image href="${img}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <polygon points="0,0 184,0 0,184" fill="${t.accent}"/>
    ${opts.label ? chip(opts.label, 1152, 56, t, "end") : ""}
    <polygon points="0,436 1200,376 1200,630 0,630" fill="${t.bg}" fill-opacity="0.95"/>
    <text x="48" y="${firstBaseline - 44}" font-family="DM Sans" font-size="26" font-weight="600" fill="${t.accent}">${esc(opts.eyebrow || "The build")}</text>
    ${titleLines(lines, 48, titleBaseline, t)}
    <text x="48" y="${bylineY}" font-family="DM Sans" font-size="26" fill="${t.text}" fill-opacity="0.65">${esc("Portfolio · " + t.site)}</text>
  </g>
</svg>`;
}

export const TEMPLATES: Record<string, Template> = {
  default: {
    name: "default",
    description: "Brand howl card (no dynamic content)",
    fields: [],
    render: renderDefault,
  },
  blog: {
    name: "blog",
    description: "Post card: photo background, category chip, wrapped title, byline",
    fields: ["title", "label", "image"],
    render: renderBlog,
  },
  project: {
    name: "project",
    description: "Case-study card: eyebrow, tag chip right, wrapped title",
    fields: ["title", "label", "image", "eyebrow"],
    render: renderProject,
  },
};
