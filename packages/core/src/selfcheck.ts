// Smallest thing that fails if the templates break: render every template
// under every theme, assert well-formed SVG + theme + content markers.
// Run: npm run check -w @howlcard/core
import { THEMES } from "./theme";
import { TEMPLATES } from "./templates";
import { wrapTitle } from "./svg";
import assert from "node:assert";

for (const [tname, theme] of Object.entries(THEMES)) {
  for (const [name, tpl] of Object.entries(TEMPLATES)) {
    const svg = tpl.render(
      { title: "WordPress SEO Tips to Boost Your Site's Visibility", label: "WordPress" },
      theme,
    );
    assert(svg.startsWith("<svg"), `${name}/${tname}: not svg`);
    assert(svg.includes("</svg>"), `${name}/${tname}: unterminated`);
    assert(svg.includes(theme.accent), `${name}/${tname}: accent missing`);
    assert(svg.includes(theme.bg), `${name}/${tname}: bg missing`);
    if (tpl.fields.includes("title"))
      assert(svg.includes("WordPress SEO Tips"), `${name}/${tname}: title missing`);
    assert(!svg.includes("undefined"), `${name}/${tname}: leaked undefined`);
  }
}

// wrapTitle behavior: short = 1 line, long = 2 lines + ellipsis
assert.deepEqual(wrapTitle("Short title"), ["Short title"]);
const long = wrapTitle(
  "A very long title that absolutely cannot fit on two lines of thirty eight characters no way",
);
assert.equal(long.length, 2);
assert(long[1].endsWith("…"), "long title not truncated");

// escaping
const svg = TEMPLATES.blog.render({ title: `<script>"x" & 'y'</script>` }, THEMES.default);
assert(!svg.includes("<script>"), "title not escaped");

console.log("selfcheck OK:", Object.keys(TEMPLATES).length, "templates x", Object.keys(THEMES).length, "themes");
