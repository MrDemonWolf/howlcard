# MrDemonWolf OG Tool - OpenGraph Cards in Your Browser

MrDemonWolf OG Tool generates 1200x630 OpenGraph social cards for
mrdemonwolf.com, rendered entirely in the browser and hosted as a
static site on GitHub Pages. Paste a blog, service, or portfolio URL
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
- **Static deploy** - plain Vite build pushed to GitHub Pages by the
  bundled Actions workflow on every push to `main`.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mrdemonwolf/mrdemonwolf-og-tool.git
   cd mrdemonwolf-og-tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
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
4. Click **Download PNG** and upload the file to WordPress (Rank
   Math social image, or the media library).

The live tool deploys to
`https://mrdemonwolf.github.io/mrdemonwolf-og-tool/`.

## Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Hosting   | GitHub Pages (Actions deploy)              |
| Bundler   | Vite                                       |
| Rendering | @resvg/resvg-wasm (SVG to PNG, in-browser) |
| Data      | WordPress REST API (`/wp-json/wp/v2/`)     |
| Templates | TypeScript SVG functions                   |
| Fonts     | DM Sans, JetBrains Mono (vendored TTF)     |

## Development

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the checks:
   ```bash
   npm run check
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### Development Scripts

- `npm run dev` - Vite dev server
- `npm run build` - production build into `dist/`
- `npm run preview` - serve the production build locally
- `npm run check` - type-check and run the template self-check
- `npm run check-types` - type-check only

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
└── .github/workflows/pages.yml  # build + deploy to GitHub Pages
```

## License

![GitHub license](https://img.shields.io/github/license/mrdemonwolf/mrdemonwolf-og-tool.svg?style=for-the-badge&logo=github)

## Contact

Have questions or feedback?

- Discord: [Join my server](https://mrdwolf.net/discord)
- Website: [mrdemonwolf.com](https://www.mrdemonwolf.com)

Made with love by [MrDemonWolf, Inc.](https://www.mrdemonwolf.com)
