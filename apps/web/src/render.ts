// Worker-side rasterizer: SVG (from @howlcard/core) -> PNG via resvg WASM.
// The native @resvg/resvg-js binding never runs on Workers; the WASM build
// does. Fonts load as buffers (never paths): resvg silently renders NO TEXT
// when a font path misses (see the website repo's handoff doc, gotcha #1).
import { Resvg, initWasm } from "@resvg/resvg-wasm";
// npm workspaces hoist the package to the repo root node_modules.
import resvgWasm from "../../../node_modules/@resvg/resvg-wasm/index_bg.wasm";
import dmSans400 from "./fonts/dm-sans-400.ttf";
import dmSans600 from "./fonts/dm-sans-600.ttf";
import jbMono400 from "./fonts/jetbrains-mono-400.ttf";

const fontBuffers = [
  new Uint8Array(dmSans400),
  new Uint8Array(dmSans600),
  new Uint8Array(jbMono400),
];

let ready: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!ready) ready = initWasm(resvgWasm as WebAssembly.Module);
  return ready;
}

export async function rasterize(svg: string): Promise<Uint8Array> {
  await ensureWasm();
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontBuffers,
      loadSystemFonts: false,
      defaultFontFamily: "DM Sans",
    },
  });
  return r.render().asPng();
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const mimeFor = (url: string) => {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ext === "png"
    ? "image/png"
    : ext === "webp"
      ? "image/webp"
      : ext === "gif"
        ? "image/gif"
        : "image/jpeg";
};

// Fetch a background image server-side (no Referer, some hosts 403 on
// foreign referers) and embed as a data URI. Fails soft: null = text-only card.
export async function fetchImageDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "howlcard" },
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) return null;
    let bin = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${res.headers.get("content-type") || mimeFor(url)};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}
