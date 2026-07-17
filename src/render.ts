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
