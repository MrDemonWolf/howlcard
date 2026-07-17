// Pull card data from a mrdemonwolf.com URL via the WordPress REST API
// (which sends CORS headers; the HTML pages do not). Detects the page type
// from the URL path, then queries the matching post-type endpoints by slug.
export type Pulled = {
  type: "blog" | "portfolio" | "service" | "default";
  title?: string;
  label?: string;
  /** featured image URL (may not be fetchable cross-origin; caller handles) */
  imageUrl?: string;
  note?: string;
};

type WpPost = {
  title?: { rendered?: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string }[];
    "wp:term"?: { taxonomy?: string; name?: string }[][];
  };
};

const decode = (s: string) => {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
};

function typeFor(path: string): Pulled["type"] {
  if (path.startsWith("/blog/")) return "blog";
  if (path.startsWith("/project/") || path.startsWith("/portfolio/")) return "portfolio";
  if (path.startsWith("/services/") || path.startsWith("/service/")) return "service";
  return "default";
}

// REST bases to try per type. Divi registers `project`; services vary by
// setup, so fall through to pages/posts.
const BASES: Record<Pulled["type"], string[]> = {
  blog: ["posts"],
  portfolio: ["project", "posts", "pages"],
  service: ["service", "pages", "posts"],
  default: ["pages", "posts"],
};

export async function pullFromUrl(raw: string): Promise<Pulled> {
  const url = new URL(raw);
  const type = typeFor(url.pathname);
  const slug = url.pathname.split("/").filter(Boolean).pop() || "";
  if (!slug || type === "default") {
    return { type, note: "No slug in that URL; using the site default card." };
  }

  for (const base of BASES[type]) {
    try {
      const api = `${url.origin}/wp-json/wp/v2/${base}?slug=${encodeURIComponent(slug)}&_embed=1`;
      const res = await fetch(api);
      if (!res.ok) continue;
      const items = (await res.json()) as WpPost[];
      const item = items?.[0];
      if (!item?.title?.rendered) continue;
      const media = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
      const cat = item._embedded?.["wp:term"]
        ?.flat()
        .find((t) => t?.taxonomy === "category" || t?.taxonomy === "project_category")?.name;
      return {
        type,
        title: decode(item.title.rendered),
        label: cat ? decode(cat) : undefined,
        imageUrl: media,
      };
    } catch {
      // CORS or network: try the next base
    }
  }
  return {
    type,
    note: "Could not reach the WordPress REST API for that URL (CORS or not found). Fill the fields manually.",
  };
}
