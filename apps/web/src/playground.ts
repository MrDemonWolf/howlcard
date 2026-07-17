// The playground page: pick a template + theme, type the fields, live preview,
// download the PNG. Server-rendered static string; zero client deps.
import { TEMPLATES, THEMES } from "@howlcard/core";

const templateOptions = Object.values(TEMPLATES)
  .map((t) => `<option value="${t.name}">${t.name} · ${t.description}</option>`)
  .join("");
const themeOptions = Object.keys(THEMES)
  .map((n) => `<option value="${n}">${n}</option>`)
  .join("");
const fieldMeta = JSON.stringify(
  Object.fromEntries(Object.values(TEMPLATES).map((t) => [t.name, t.fields])),
);

export const PLAYGROUND = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HowlCard playground</title>
<style>
  :root { --navy:#0A1633; --panel:#16244A; --accent:#3AAEE3; --text:#F5F7FB; --sub:#9FD3EF; }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; background:var(--navy); color:var(--text);
    font:15px/1.5 "DM Sans", -apple-system, system-ui, sans-serif; }
  main { max-width:1080px; margin:0 auto; padding:32px 20px 60px; }
  h1 { font-size:26px; margin:0 0 2px; } h1 span { color:var(--accent); }
  .sub { color:var(--sub); margin:0 0 22px; font-size:14px; }
  .grid { display:grid; grid-template-columns: 320px 1fr; gap:24px; align-items:start; }
  @media (max-width:800px){ .grid { grid-template-columns:1fr; } }
  form { background:var(--panel); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px; }
  label { font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--sub); display:flex; flex-direction:column; gap:5px; }
  input, select { font:14px "DM Sans", system-ui, sans-serif; color:var(--text);
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14);
    border-radius:9px; padding:9px 11px; outline:none; }
  input:focus, select:focus { border-color:var(--accent); }
  select option { color:#111; }
  .preview { background:var(--panel); border-radius:14px; padding:18px; }
  .preview img { width:100%; border-radius:10px; display:block; background:#0008; min-height:200px; }
  .row { display:flex; gap:10px; margin-top:14px; }
  a.btn, button.btn { flex:1; text-align:center; font:600 14px "DM Sans", sans-serif;
    background:var(--accent); color:#06243F; border:0; border-radius:999px;
    padding:11px 16px; cursor:pointer; text-decoration:none; }
  .url { margin-top:12px; font:12px ui-monospace, monospace; color:var(--sub); word-break:break-all;
    background:rgba(255,255,255,.05); border-radius:8px; padding:8px 10px; }
  .hide { display:none; }
</style>
</head>
<body>
<main>
  <h1>HowlCard<span>.</span></h1>
  <p class="sub">Config-driven OpenGraph cards, 1200×630 PNG, rendered on the edge. Point og:image at the URL below or download the file.</p>
  <div class="grid">
    <form id="f">
      <label>Template <select name="template">${templateOptions}</select></label>
      <label>Theme <select name="theme">${themeOptions}</select></label>
      <label data-f="title">Title <input name="title" value="WordPress SEO Tips to Boost Your Site's Visibility" /></label>
      <label data-f="label">Chip label <input name="label" value="WordPress" /></label>
      <label data-f="image">Image URL (optional) <input name="image" placeholder="https://..." /></label>
      <label data-f="eyebrow">Eyebrow <input name="eyebrow" placeholder="The build" /></label>
    </form>
    <div class="preview">
      <img id="img" alt="card preview" />
      <div class="row">
        <a class="btn" id="dl" download="howlcard.png">Download PNG</a>
      </div>
      <div class="url" id="url"></div>
    </div>
  </div>
</main>
<script>
  const FIELDS = ${fieldMeta};
  const f = document.getElementById("f"), img = document.getElementById("img"),
        dl = document.getElementById("dl"), urlBox = document.getElementById("url");
  let t;
  function sync() {
    const data = new FormData(f);
    const tpl = data.get("template");
    document.querySelectorAll("[data-f]").forEach(el =>
      el.classList.toggle("hide", !FIELDS[tpl].includes(el.dataset.f)));
    const q = new URLSearchParams();
    for (const [k, v] of data) if (v && (k === "template" || k === "theme" || FIELDS[tpl].includes(k))) q.set(k, v);
    const u = "/og.png?" + q.toString();
    img.src = u; dl.href = u;
    urlBox.textContent = location.origin + u;
  }
  f.addEventListener("input", () => { clearTimeout(t); t = setTimeout(sync, 350); });
  sync();
</script>
</body>
</html>`;
