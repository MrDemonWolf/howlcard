// A theme is every brand-specific value a template may use. Templates never
// hardcode colors or names; they read them from here.
export type Theme = {
  /** page background */
  bg: string;
  /** panel behind text when a photo covers the card */
  panel: string;
  /** accent (chips, underline, wolf mark) */
  accent: string;
  /** primary text */
  text: string;
  /** secondary text (taglines) */
  subtext: string;
  /** text on accent-colored chips */
  chipText: string;
  /** big wordmark on the default card */
  brand: string;
  /** short tagline under the wordmark */
  tagline: string;
  /** mono URL line on the default card */
  site: string;
  /** byline on content cards */
  byline: string;
};

export const THEMES: Record<string, Theme> = {
  // MrDemonWolf v6 Brand Blues (the original website card).
  default: {
    bg: "#0A1633",
    panel: "#16244A",
    accent: "#3AAEE3",
    text: "#F5F7FB",
    subtext: "#9FD3EF",
    chipText: "#06243F",
    brand: "MrDemonWolf",
    tagline: "Wisconsin web and application developer",
    site: "mrdemonwolf.com",
    byline: "Nathanial Henniges · mrdemonwolf.com",
  },
  ember: {
    bg: "#1C0E08",
    panel: "#2B1810",
    accent: "#E3702E",
    text: "#FBF4EF",
    subtext: "#F3B98E",
    chipText: "#2B1206",
    brand: "MrDemonWolf",
    tagline: "Wisconsin web and application developer",
    site: "mrdemonwolf.com",
    byline: "Nathanial Henniges · mrdemonwolf.com",
  },
  forest: {
    bg: "#0B1F15",
    panel: "#143023",
    accent: "#3ECF8E",
    text: "#F1FAF5",
    subtext: "#9FE3C4",
    chipText: "#062416",
    brand: "MrDemonWolf",
    tagline: "Wisconsin web and application developer",
    site: "mrdemonwolf.com",
    byline: "Nathanial Henniges · mrdemonwolf.com",
  },
  mono: {
    bg: "#101014",
    panel: "#1C1C22",
    accent: "#E6E6EA",
    text: "#F5F5F7",
    subtext: "#A7A7B0",
    chipText: "#101014",
    brand: "MrDemonWolf",
    tagline: "Wisconsin web and application developer",
    site: "mrdemonwolf.com",
    byline: "Nathanial Henniges · mrdemonwolf.com",
  },
};

export function getTheme(name?: string): Theme {
  return THEMES[name || "default"] || THEMES.default;
}
