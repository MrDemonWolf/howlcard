// Brand values every template reads. One theme: the v6 Brand Blues from
// mrdemonwolf.com. Page-type presets (templates.ts) decide the look; add a
// second Theme object here only if a genuinely different brand shows up.
export type Theme = {
  bg: string;
  panel: string;
  accent: string;
  text: string;
  subtext: string;
  chipText: string;
  brand: string;
  tagline: string;
  site: string;
  byline: string;
};

export const BRAND: Theme = {
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
};
