// Smallest thing that fails if the templates break: render every page type,
// assert well-formed SVG + brand + content markers. Run: npm run check
import { PAGE_TYPES } from "./templates";
import { BRAND } from "./theme";
import { wrapTitle } from "./svg";
import assert from "node:assert";

for (const [name, tpl] of Object.entries(PAGE_TYPES)) {
  const svg = tpl.render({
    title: "WordPress SEO Tips to Boost Your Site's Visibility",
    label: "WordPress",
  });
  assert(svg.startsWith("<svg"), `${name}: not svg`);
  assert(svg.includes("</svg>"), `${name}: unterminated`);
  assert(svg.includes(BRAND.accent), `${name}: accent missing`);
  assert(svg.includes(BRAND.bg), `${name}: bg missing`);
  if (tpl.fields.includes("title"))
    assert(svg.includes("WordPress SEO Tips"), `${name}: title missing`);
  assert(!svg.includes("undefined"), `${name}: leaked undefined`);
}

assert(PAGE_TYPES.portfolio.render({ title: "X" }).includes("The build"), "portfolio eyebrow");
assert(PAGE_TYPES.service.render({ title: "X" }).includes("Services"), "service eyebrow");

assert.deepEqual(wrapTitle("Short title"), ["Short title"]);
const long = wrapTitle(
  "A very long title that absolutely cannot fit on two lines of thirty eight characters no way",
);
assert.equal(long.length, 2);
assert(long[1].endsWith("…"), "long title not truncated");

const svg = PAGE_TYPES.blog.render({ title: `<script>"x" & 'y'</script>` });
assert(!svg.includes("<script>"), "title not escaped");

// Logo path: a data: URI takes the mark slot, anything else is ignored.
const PNG = "data:image/png;base64,iVBORw0KGgo=";
const withLogo = PAGE_TYPES.blog.render({ title: "X", logo: PNG });
assert(withLogo.includes(`<image href="${PNG}"`), "blog: logo not embedded");
assert(!withLogo.includes("M22 38 L12 22"), "blog: wolf badge still drawn under a logo");
assert(PAGE_TYPES.blog.render({ title: "X" }).includes("M22 38 L12 22"), "blog: wolf badge lost");

const defLogo = PAGE_TYPES.default.render({ logo: PNG });
assert(defLogo.includes(`<image href="${PNG}"`), "default: logo watermark missing");
assert(!defLogo.includes(`<use href="#wpath"`), "default: wolf watermark still drawn");

for (const name of ["portfolio", "service"] as const) {
  const bare = PAGE_TYPES[name].render({ title: "X" });
  assert(!bare.includes(`href="#mk"`), `${name}: mark drawn without a logo`);
  assert(PAGE_TYPES[name].render({ title: "X", logo: PNG }).includes(`href="#mk"`),
    `${name}: logo mark missing`);
}

for (const bad of ["javascript:alert(1)", "https://evil.test/x.png"]) {
  for (const name of Object.keys(PAGE_TYPES)) {
    assert(!PAGE_TYPES[name].render({ title: "X", logo: bad }).includes(bad),
      `${name}: non-data logo href leaked into the SVG`);
  }
}

console.log("selfcheck OK:", Object.keys(PAGE_TYPES).length, "page types");
