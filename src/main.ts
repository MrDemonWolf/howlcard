import { PAGE_TYPES } from "./templates";
import { rasterize, fileToDataUri, urlToDataUri } from "./render";
import { pullFromUrl } from "./wp";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const typeSel = $<HTMLSelectElement>("type");
const titleIn = $<HTMLInputElement>("title");
const labelIn = $<HTMLInputElement>("label");
const urlIn = $<HTMLInputElement>("url");
const pullBtn = $<HTMLButtonElement>("pull");
const pullNote = $("pullnote");
const drop = $("drop");
const fileIn = $<HTMLInputElement>("file");
const imgNote = $("imgnote");
const preview = $<HTMLImageElement>("img");
const dl = $<HTMLAnchorElement>("dl");

let imageDataUri: string | undefined;
let lastBlobUrl: string | null = null;
let timer: number | undefined;

function syncFields() {
  const fields = PAGE_TYPES[typeSel.value].fields as string[];
  document.querySelectorAll<HTMLElement>("[data-f]").forEach((el) => {
    el.classList.toggle("hide", !fields.includes(el.dataset.f!));
  });
}

async function renderNow() {
  const tpl = PAGE_TYPES[typeSel.value];
  const svg = tpl.render({
    title: titleIn.value,
    label: labelIn.value,
    image: imageDataUri,
  });
  const png = await rasterize(svg);
  const blob = new Blob([png as Uint8Array<ArrayBuffer>], { type: "image/png" });
  if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
  lastBlobUrl = URL.createObjectURL(blob);
  preview.src = lastBlobUrl;
  dl.href = lastBlobUrl;
  const slug = (titleIn.value || typeSel.value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  dl.download = `og-${slug || "card"}.png`;
}

function queueRender() {
  clearTimeout(timer);
  timer = window.setTimeout(() => void renderNow(), 300);
}

pullBtn.addEventListener("click", async () => {
  if (!urlIn.value) return;
  pullBtn.disabled = true;
  pullNote.textContent = "Pulling…";
  imgNote.textContent = "";
  try {
    const p = await pullFromUrl(urlIn.value);
    typeSel.value = p.type;
    if (p.title) titleIn.value = p.title;
    if (p.label) labelIn.value = p.label;
    pullNote.textContent = p.note || `Pulled: ${p.title || "(no title)"}`;
    imageDataUri = undefined;
    if (p.imageUrl) {
      imgNote.textContent = "Fetching featured image…";
      const uri = await urlToDataUri(p.imageUrl);
      if (uri) {
        imageDataUri = uri;
        imgNote.textContent = "Featured image embedded.";
      } else {
        imgNote.textContent =
          "The site blocked the image fetch (no CORS on media). Save the featured image and drop it here.";
      }
    }
  } catch (e) {
    pullNote.textContent = `Pull failed: ${(e as Error).message}`;
  } finally {
    pullBtn.disabled = false;
    syncFields();
    queueRender();
  }
});

drop.addEventListener("click", () => fileIn.click());
drop.addEventListener("dragover", (e) => {
  e.preventDefault();
  drop.classList.add("armed");
});
drop.addEventListener("dragleave", () => drop.classList.remove("armed"));
drop.addEventListener("drop", async (e) => {
  e.preventDefault();
  drop.classList.remove("armed");
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    imageDataUri = await fileToDataUri(f);
    imgNote.textContent = `Using ${f.name}.`;
    queueRender();
  }
});
fileIn.addEventListener("change", async () => {
  const f = fileIn.files?.[0];
  if (f) {
    imageDataUri = await fileToDataUri(f);
    imgNote.textContent = `Using ${f.name}.`;
    queueRender();
  }
});

typeSel.addEventListener("change", () => {
  syncFields();
  queueRender();
});
[titleIn, labelIn].forEach((el) => el.addEventListener("input", queueRender));

syncFields();
void renderNow();
