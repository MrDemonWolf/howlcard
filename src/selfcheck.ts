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

console.log("selfcheck OK:", Object.keys(PAGE_TYPES).length, "page types");
