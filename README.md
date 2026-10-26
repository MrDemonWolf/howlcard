# MrDemonWolf OG Tool - OpenGraph Cards in Your Browser

MrDemonWolf OG Tool generates 1200x630 OpenGraph social cards for
mrdemonwolf.com, rendered entirely in the browser and hosted as a
static site on Cloudflare Workers. Paste a blog, service, or portfolio URL
and it pulls the title, category, and featured image through the
WordPress REST API; the card design follows the page type
automatically. Extracted from the build-time card system on
mrdemonwolf.com.

Design in code. Ship cards that howl.

## Features

- **Page-type presets** - the design is decided by what the page is:
  `blog` (photo, category chip, wrapped title, byline), `portfolio`
  (The build eyebrow, tag chip), `service` (Services eyebrow), and
  `default` (brand howl card). No theme fiddling.
- **Pull from URL** - paste a mrdemonwolf.com URL; the tool detects
  the page type from the path and fills title, chip label, and
  featured image via the WordPress REST API (CORS-open by default).
- **Browser rendering** - `@resvg/resvg-wasm` rasterizes SVG to PNG
  client-side; nothing leaves your machine, no server to deploy.
- **Image drop fallback** - WordPress media files usually block
  cross-origin fetches, so the tool accepts a dropped or chosen
  image file whenever the direct fetch fails.
- **Logo or site icon** - the wolf mark is only the fallback. The pull
  reads `site_icon_url` from the WordPress REST index, and an SVG or
  PNG logo can be dropped in directly (SVG is flattened to PNG in a
  canvas first, since resvg rasterizes the card). Portfolio and
  service cards, which carry no mark by default, gain one when a logo
  is set. **Reset to wolf mark** puts it back.
- **Static deploy** - plain Vite build served from Cloudflare Workers
  static assets, gated by Cloudflare Access, deployed by the bundled
  Actions workflow after CI passes on `main`. Never deployed from a laptop.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mrdemonwolf/mrdemonwolf-og-tool.git
   cd mrdemonwolf-og-tool
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the dev server:
   ```bash
   bun run dev
   ```
4. Open the printed localhost URL and build a card.

## Usage

1. Paste a page URL (for example
   `https://www.mrdemonwolf.com/blog/my-post/`) and click **Pull**.
2. Adjust the title or chip label if wanted; the preview re-renders
   as you type.
3. If the featured image could not be fetched (most WordPress hosts
   block cross-origin media reads), save it from the site and drop
   the file onto the image box.
4. To brand the card with something other than the wolf mark, drop an
   SVG or PNG logo on the **Logo / site icon** box. The pull fills this
   automatically when the site allows the icon to be read cross-origin.
5. Click **Download PNG** and upload the file to WordPress (Rank
   Math social image, or the media library).

The live tool deploys to `https://og.mrdemonwolf.com` and sits behind
Cloudflare Access, so you sign in before the page loads.

## Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Hosting   | Cloudflare Workers static assets + Access  |
| Bundler   | Vite                                       |
| Rendering | @resvg/resvg-wasm (SVG to PNG, in-browser) |
| Data      | WordPress REST API (`/wp-json/wp/v2/`)     |
| Templates | TypeScript SVG functions                   |
| Fonts     | DM Sans, JetBrains Mono (vendored TTF)     |

## Development

### Prerequisites

- Bun 1.2 or newer

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```
2. Run the checks:
   ```bash
   bun run check
   ```
3. Start the dev server:
   ```bash
   bun run dev
   ```

### Development Scripts

- `bun run dev` - Vite dev server
- `bun run build` - production build into `dist/`
- `bun run preview` - serve the production build locally
- `bun run check` - type-check and run the template self-check
- `bun run check-types` - type-check only
- `bun run deploy` - build and publish to Cloudflare Workers (GitHub Actions on
  `main` only; refused on a laptop)

### Code Quality

- Strict TypeScript
- A runnable self-check renders every page type and guards
  well-formed SVG, escaping, eyebrow text, and title wrapping
- Fonts load as buffers, never file paths (resvg renders no text on
  a missed path)

## Project Structure

```
mrdemonwolf-og-tool/
├── index.html             # the app shell (form + preview)
├── src/
│   ├── main.ts              # UI wiring: pull, drop, render, download
│   ├── templates.ts         # page-type presets (blog/portfolio/service/default)
│   ├── theme.ts             # brand values (v6 Brand Blues)
│   ├── svg.ts               # esc, wrapTitle, chip, wolf mark
│   ├── wp.ts                # WordPress REST pull by URL
│   ├── render.ts            # resvg-wasm rasterizer + image helpers
│   ├── selfcheck.ts         # runnable template guard
│   └── fonts/               # vendored TTFs
├── wrangler.jsonc            # Workers static-assets config
├── .github/workflows/ci.yml     # checks every PR and push to main
└── .github/workflows/deploy.yml # deploys after CI passes on main
```

## License

![GitHub license](https://img.shields.io/github/license/mrdemonwolf/mrdemonwolf-og-tool.svg?style=for-the-badge&logo=github)

## Contact

Have questions or feedback?

- Discord: [Join my server](https://mrdwolf.net/discord)
- Website: [mrdemonwolf.com](https://www.mrdemonwolf.com)

Made with love by [MrDemonWolf, Inc.](https://www.mrdemonwolf.com)
