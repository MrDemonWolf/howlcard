# HowlCard - OpenGraph Cards Rendered on the Edge

HowlCard is a config-driven OpenGraph card generator that renders
1200x630 PNG social cards on Cloudflare Workers. Templates are pure
TypeScript functions that emit SVG, themes carry every brand value
(colors, fonts, byline), and a built-in playground lets you preview
and download cards or point `og:image` straight at a URL. Extracted
from the build-time card system on mrdemonwolf.com.

Design in code. Ship cards that howl.

## Features

- **Three starter templates** - `default` (brand howl card), `blog`
  (photo background, category chip, wrapped title, byline), and
  `project` (eyebrow, tag chip, case-study framing), ported
  pixel-identical from mrdemonwolf.com.
- **Themes over hardcoding** - every color and text value lives in a
  `Theme`; four built in (`default`, `ember`, `forest`, `mono`), new
  ones are a single object in `packages/core/src/theme.ts`.
- **Edge rendering** - `@resvg/resvg-wasm` rasterizes SVG to PNG
  inside the Worker; no native binaries, no build step per card.
- **Playground** - the Worker's `/` route serves a live editor: pick
  template and theme, type the fields, preview, download.
- **URL API** - `/og.png?template=blog&theme=default&title=...` is a
  stable image URL you can use directly in `og:image` tags.
- **Remote image embedding** - `image=` query param fetches a photo
  server-side (no Referer, so hotlink-protected hosts work) and
  embeds it; failures fall back to the text-only card.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mrdemonwolf/howlcard.git
   cd howlcard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local playground:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:8787` and build a card.

## Usage

Render a card by URL (all params optional except `template` fields):

```bash
# Brand card, default theme
/og.png?template=default

# Blog card with a category chip and a background photo
/og.png?template=blog&theme=default&title=My%20Post%20Title&label=WordPress&image=https://example.com/photo.jpg

# Project card with the "The build" eyebrow and a tag chip
/og.png?template=project&title=Aurum%20Contracting&label=WordPress
```

Point a page's OpenGraph tag at the deployed Worker:

```html
<meta property="og:image" content="https://howlcard.<your-subdomain>.workers.dev/og.png?template=blog&title=Hello" />
```

Endpoints:

| Route     | Purpose                                        |
| --------- | ---------------------------------------------- |
| `/`       | Playground (template picker, preview, download) |
| `/og.png` | PNG renderer (query-param driven)              |
| `/health` | JSON status and template list                  |

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Runtime    | Cloudflare Workers                |
| Framework  | Hono                              |
| Rendering  | @resvg/resvg-wasm (SVG to PNG)    |
| Templates  | TypeScript SVG functions          |
| Fonts      | DM Sans, JetBrains Mono (vendored TTF) |
| Tooling    | npm workspaces, Wrangler, tsx     |

## Development

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A Cloudflare account (for `npm run deploy`)

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

- `npm run dev` - Wrangler dev server for the playground and API
- `npm run deploy` - deploy the Worker to Cloudflare
- `npm run check` - type-check all workspaces and run the core
  self-check (renders every template under every theme)
- `npm run check-types` - type-check only

### Code Quality

- Strict TypeScript across both workspaces
- A runnable self-check in `@howlcard/core` guards template output
  (well-formed SVG, theme colors present, escaping, title wrapping)
- Fonts load as buffers, never file paths (resvg renders no text on
  a missed path)

## Project Structure

```
howlcard/
├── apps/
│   └── web/               # Cloudflare Worker (Hono)
│       ├── src/
│       │   ├── index.ts     # routes: /, /og.png, /health
│       │   ├── render.ts    # resvg-wasm rasterizer + image fetcher
│       │   ├── playground.ts # served playground page
│       │   └── fonts/       # vendored TTFs (DM Sans, JetBrains Mono)
│       └── wrangler.jsonc
└── packages/
    └── core/              # pure template + theme engine (no I/O)
        └── src/
            ├── templates.ts # default / blog / project
            ├── theme.ts     # Theme type + built-in themes
            ├── svg.ts       # esc, wrapTitle, chip, wolf mark
            └── selfcheck.ts # runnable output guard
```

## License

![GitHub license](https://img.shields.io/github/license/mrdemonwolf/howlcard.svg?style=for-the-badge&logo=github)

## Contact

Have questions or feedback?

- Discord: [Join my server](https://mrdwolf.net/discord)
- Website: [mrdemonwolf.com](https://www.mrdemonwolf.com)

Made with love by [MrDemonWolf, Inc.](https://www.mrdemonwolf.com)
