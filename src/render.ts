// Browser-side rasterizer: SVG string -> PNG bytes via resvg WASM.
// Fonts load as buffers, never paths (resvg silently renders NO TEXT when a
// font path misses; see the website repo's handoff doc).
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";
import dm400Url from "./fonts/dm-sans-400.ttf?url";
import dm600Url from "./fonts/dm-sans-600.ttf?url";
import mono400Url from "./fonts/jetbrains-mono-400.ttf?url";

let ready: Promise<Uint8Array[]> | null = null;
function ensure(): Promise<Uint8Array[]> {
  if (!ready) {
    ready = (async () => {
      await initWasm(fetch(wasmUrl));
      return Promise.all(
        [dm400Url, dm600Url, mono400Url].map(async (u) =>
          new Uint8Array(await (await fetch(u)).arrayBuffer()),
        ),
      );
    })();
  }
  return ready;
}

export async function rasterize(svg: string): Promise<Uint8Array> {
  const fontBuffers = await ensure();
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { fontBuffers, loadSystemFonts: false, defaultFontFamily: "DM Sans" },
  });
  return r.render().asPng();
}

const mimeFor = (name: string) => {
  const ext = name.split("?")[0].split(".").pop()?.toLowerCase();
  return ext === "png"
    ? "image/png"
    : ext === "webp"
      ? "image/webp"
      : ext === "gif"
        ? "image/gif"
        : "image/jpeg";
};

export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Logos arrive as SVG about as often as PNG, and resvg's nested-SVG support in
// `<image>` is not something to bet the card render on. Flatten SVG to a PNG
// data URI through a canvas first; every other type passes straight through.
export async function logoFileToDataUri(file: File, size = 512): Promise<string> {
  const raw = await fileToDataUri(file);
  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  if (!isSvg) return raw;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("That SVG could not be decoded."));
    img.src = raw;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  // An SVG with only a viewBox reports no intrinsic size in some browsers;
  // fall back to a square box so it still lands centred.
  const w = img.naturalWidth || size;
  const h = img.naturalHeight || size;
  const scale = Math.min(size / w, size / h);
  ctx.drawImage(img, (size - w * scale) / 2, (size - h * scale) / 2, w * scale, h * scale);
  return canvas.toDataURL("image/png");
}

// Try to fetch a remote image into a data URI. WordPress media files usually
// ship no CORS headers, so this often fails from the browser; the caller
// falls back to asking for a local file drop.
export async function urlToDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
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
