import { Hono } from "hono";
import { TEMPLATES, getTheme } from "@howlcard/core";
import { rasterize, fetchImageDataUri } from "./render";
import { PLAYGROUND } from "./playground";

const app = new Hono();

app.get("/", (c) => c.html(PLAYGROUND));

app.get("/og.png", async (c) => {
  const q = c.req.query();
  const tpl = TEMPLATES[q.template || "default"];
  if (!tpl) return c.text(`Unknown template. Try: ${Object.keys(TEMPLATES).join(", ")}`, 400);
  const theme = getTheme(q.theme);

  let image: string | undefined;
  if (q.image && /^https?:\/\//.test(q.image)) {
    image = (await fetchImageDataUri(q.image)) ?? undefined;
  }

  const svg = tpl.render(
    { title: q.title, label: q.label, eyebrow: q.eyebrow, image },
    theme,
  );
  const png = await rasterize(svg);
  return c.body(png as Uint8Array<ArrayBuffer>, 200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=3600",
  });
});

app.get("/health", (c) => c.json({ ok: true, templates: Object.keys(TEMPLATES) }));

export default app;
