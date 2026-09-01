# Handoff: mrdemonwolf-og-tool

Written 2026-09-01. Everything below was verified by running it, not assumed.
Read this before touching the repo; it covers what the project is, what just
changed, and the traps that already cost time.

## What the project is

An OpenGraph card generator for mrdemonwolf.com. It renders 1200x630 PNG social
cards **entirely in the browser** and has no server component. You paste a
mrdemonwolf.com URL, it pulls title / category / featured image from the
WordPress REST API, picks a card design from the page type, and gives you a PNG
to download.

- Repo: `mrdemonwolf/mrdemonwolf-og-tool`
- Branch this work is on: `claude/cloudflare-workers-deploy-test-f417fe`
- Owner: Nathanial Henniges (MrDemonWolf, Inc.)
- Stack: Vite 6 + TypeScript 5 (strict), no framework, no bundled UI library
- Rendering: `@resvg/resvg-wasm` rasterizes an SVG string to PNG client-side
- Fonts: DM Sans 400/600 + JetBrains Mono 400, vendored TTFs in `src/fonts/`

### Hard rule: Bun, not npm

`bun` is the package manager. `package-lock.json` was deleted on purpose;
`bun.lock` is committed and canonical. Use `bun install`, `bun run <script>`,
`bunx wrangler`. Do not reintroduce npm anywhere, including in CI or docs.

### Source map

| File | What it holds |
| --- | --- |
| `index.html` | The whole UI: form, drop boxes, preview, inline CSS |
| `src/main.ts` | DOM wiring, state, debounced re-render |
| `src/templates.ts` | The four card designs, as template-literal SVG |
| `src/theme.ts` | `BRAND` colors and strings (v6 Brand Blues) |
| `src/svg.ts` | `esc`, `wrapTitle`, `chip`, `titleLines`, marks |
| `src/wp.ts` | WordPress REST pull, page-type detection |
| `src/render.ts` | resvg init, rasterize, file/URL to data URI |
| `src/selfcheck.ts` | Runnable assertions over every template |
| `wrangler.jsonc` | Cloudflare Workers static-assets config |

Four page types, keyed off the URL path: `blog`, `portfolio`, `service`,
`default`. The design is decided by the type; there is deliberately no separate
theme picker.

## Commands

```bash
bun install
bun run dev          # Vite dev server, localhost:5173
bun run check        # tsc --noEmit && tsx src/selfcheck.ts
bun run build        # -> dist/
bun run preview      # serve the production build
bun run deploy       # bun run build && wrangler deploy
bunx wrangler dev    # serve dist/ on the real Workers runtime, offline
```

`bun run check` is the gate. It renders every template and asserts on the
output; it catches template regressions that a type-check cannot.

## Change 1: GitHub Pages to Cloudflare Workers behind Access

### Why

Nathanial wants the tool private, gated by Cloudflare Access.

### The constraint that shaped it

**Cloudflare Access cannot protect a `*.workers.dev` URL.** Access applications
attach to a hostname on a zone in the account, and `workers.dev` is not such a
zone. That forces a custom domain. The chosen hostname is
`og.mrdemonwolf.com`, on the already-owned `mrdemonwolf.com` zone. The team
domain `mrdemonwolf.cloudflareaccess.com` already exists from another project.

The GitHub Pages deploy was removed in the same pass. Access is worthless while
an identical copy of the site is public at
`mrdemonwolf.github.io/mrdemonwolf-og-tool/`.

### What changed

- **`wrangler.jsonc`** (new). Assets-only Worker: no `main`, no Worker script,
  because nothing in this app needs server-side execution. `not_found_handling`
  is `single-page-application`. `routes` declares `og.mrdemonwolf.com` as a
  `custom_domain`.
- **`package.json`**: added `wrangler` to devDependencies and the `deploy`
  script. Deleted `package-lock.json`.
- **`.github/workflows/pages.yml` deleted**, replaced by
  **`.github/workflows/deploy.yml`**: `oven-sh/setup-bun` then
  `bun install --frozen-lockfile`, `bun run check`, `bun run build`, then
  `cloudflare/wrangler-action@v3` with `packageManager: bun`.
- **`.gitignore`**: added `.wrangler/`.
- **`.claude/launch.json`** (new): dev-server config for the agent's browser
  preview. Harmless, delete if unwanted.
- **`README.md`**: npm to bun throughout, hosting row and live URL updated.

`vite.config.ts` keeps `base: "./"`. Relative base works at a domain root as
well as at a Pages subpath, so no build change was needed.

### Verified

`bun run check` and `bun run build` pass. Under `bunx wrangler dev`: `/` returns
200 `text/html`, the hashed JS returns 200 `text/javascript`, the resvg wasm
returns 200 `application/wasm`, and `/no-such-page` returns 200 (the SPA
fallback).

### Still to do, needs Nathanial's credentials

1. `bunx wrangler login`
2. `bun run deploy` — wrangler creates the `og.mrdemonwolf.com` DNS record
   itself, since the zone is already in the account
3. Zero Trust > Access > Applications > Add a self-hosted application. Domain
   `og.mrdemonwolf.com`, path blank. Policy: Allow, Include > Emails >
   `nathanial.henniges@mrdemonwolf.com`
4. GitHub repo secrets `CLOUDFLARE_API_TOKEN` (Edit Cloudflare Workers
   template) and `CLOUDFLARE_ACCOUNT_ID`
5. Repo Settings > Pages > off
6. Confirm with `curl -sI https://og.mrdemonwolf.com`. Expect a **302** to
   `mrdemonwolf.cloudflareaccess.com`. A 200 means Access is not in front and
   something is wrong.

## Change 2: logo / site icon on the cards

### Why

The wolf mark was hardcoded. Nathanial asked for the favicon to come from the
pulled URL, or to be able to upload a logo SVG.

### What changed

**Pull path** — `src/wp.ts` gained `siteIcon(origin)`, which reads
`site_icon_url` from the WordPress REST index at `/wp-json/`. `Pulled` now
carries `logoUrl`. The request is fired before the post lookup and awaited at
each return, so it costs no extra wall-clock.

**Upload path** — `src/render.ts` gained `logoFileToDataUri(file, size = 512)`.
Non-SVG files pass straight through as a data URI. SVG is drawn into a canvas
and re-exported as PNG, because resvg's support for nested SVG inside an
`<image>` element is not worth betting the card render on. `naturalWidth` can be
0 for an SVG carrying only a `viewBox`, so it falls back to a square box.

**Templates** — `CardOpts` gained `logo?: string`. `src/svg.ts` gained
`logoBadge(href)`, which emits `<g id="mk"><image .../></g>` at the same 44x44
box as `wolfBadge`, so every existing `<use href="#mk" transform=...>` keeps
working untouched. Placement per type:

- `blog` — takes the badge slot top-right; wolf mark is the fallback
- `portfolio` and `service` — these carried **no** mark before. They now render
  one at bottom-right (`translate(1090,516) scale(1.4)`), but **only when a logo
  is set**, so stock output stays pixel-identical. First attempt put it at
  `translate(76,58)`, which collided with the accent triangle; do not move it
  back there.
- `default` — replaces the oversized wolf watermark, at
  `x=880 y=164 w=300 h=300 opacity=0.18`. First attempt used `x=884 w=340`,
  which ran off the right edge at 1224 of 1200.

**UI** — new "Logo / site icon" drop box in `index.html`, accepting
`image/svg+xml,image/*`, with a thumbnail and a "Reset to wolf mark" button.
`src/main.ts` gained `setLogo()` and `wireDrop()`; the latter collapsed the
image and logo drop handlers, which were otherwise identical.

### Security note, do not regress it

`isEmbeddableImage()` in `src/svg.ts` accepts **only** `data:image/` hrefs, and
`esc()` runs over the value. A remote URL in that attribute would make resvg
perform a network fetch at render time. `src/selfcheck.ts` asserts that
`javascript:alert(1)` and `https://evil.test/x.png` never reach the SVG for any
of the four templates.

### Verified in a real browser

Uploading an SVG produced a PNG data URI and the mark rendered through resvg on
the blog, portfolio, and default cards. The "Reset to wolf mark" button clears
state and restores the wolf.

### Known limitation, confirmed by testing, not a bug to chase

The automatic site-icon pull **does not work on mrdemonwolf.com**.
`https://www.mrdemonwolf.com/wp-json/` correctly returns
`site_icon_url: .../cropped-logo-white-border.png`, but fetching that file
cross-origin fails outright — `/wp-content/uploads/` sends no
`Access-Control-Allow-Origin` header. This is the same wall the featured-image
fetch already hits. The UI reports it and falls back to the upload box.

Fixing it properly means either adding CORS headers on the WordPress host for
`/wp-content/uploads/`, or routing the image through a proxy. The proxy option
was deliberately **rejected**: it would send the user's URLs to a third party,
which contradicts the "nothing leaves your machine" promise in the README.

A bug was found and fixed during this testing: a pull whose icon fetch failed
used to wipe a logo the user had already uploaded. It now keeps the manual logo
and says so.

## State of the working tree

Nothing is committed. `git status` on the branch shows:

```
 D .github/workflows/pages.yml
 M .gitignore
 M README.md
 M index.html
 D package-lock.json
 M package.json
 M src/main.ts
 M src/render.ts
 M src/selfcheck.ts
 M src/svg.ts
 M src/templates.ts
 M src/wp.ts
?? .claude/
?? .github/workflows/deploy.yml
?? bun.lock
?? wrangler.jsonc
?? HANDOFF.md
```

This is a **git worktree** at
`.claude/worktrees/cloudflare-workers-deploy-test-f417fe`, not the main
checkout. The stash stack is shared with every other worktree, so bare
`git stash` / `git stash pop` is unsafe here; use a WIP commit instead.

## If you pick this up

1. `bun install && bun run check` first. If the selfcheck fails, a template
   broke; the assertion message names the page type.
2. `bun run dev` and look at the card before changing SVG geometry. The
   coordinates are hand-tuned and ported from the website's build-time
   renderer, so they are easy to break silently.
3. Any new drawing code must go through `esc()`. Titles are attacker-shaped
   input in the sense that they come from a remote API.
4. Do not add a server. Every feature so far has a browser-only answer, and
   the deployment model (assets-only Worker) assumes it stays that way.
