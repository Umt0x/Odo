<div align="center">

# odo

**Visitor counter badges for your GitHub profile and website.**

Flat pills, drawn digit styles or sprite characters, counted atomically on Cloudflare's edge — and free to host.

<br>

<img src="docs/badges/default.svg" alt="1.3K"> &nbsp;
<img src="docs/badges/github-dark.svg" alt="48.2K"> &nbsp;
<img src="docs/badges/light.svg" alt="2K"> &nbsp;
<img src="docs/badges/vivid.svg" alt="982"> &nbsp;
<img src="docs/badges/mint.svg" alt="1.3M">

<br><br>

<img src="docs/badges/pixel.svg" alt="Pixel" height="28"> &nbsp;
<img src="docs/badges/led.svg" alt="LED" height="28"> &nbsp;
<img src="docs/badges/odometer.svg" alt="Odometer" height="28"> &nbsp;
<img src="docs/badges/flip.svg" alt="Flip" height="28">

<br><br>

[![License: MIT](https://img.shields.io/badge/license-MIT-black)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/runs%20on-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)

[Usage](#usage) · [Options](#options) · [Themes](#themes) · [Self-hosting](#self-hosting) · [Development](#development)

</div>

---

## Why odo

- **One line to add.** Paste a Markdown image into your README and you're done.
- **Accurate.** Every handle gets its own Durable Object, so simultaneous visits are never lost.
- **Plenty of looks.** A minimal flat pill, four digit styles drawn in code (pixel, LED, odometer, flip) — all recolorable — and sprite characters.
- **Builder included.** Open the worker in a browser to design your badge with a live preview.
- **Safe to embed.** Every input is validated, and badges are served with a strict Content-Security-Policy.
- **Free.** The Workers Free plan covers roughly 100k badge views a day.

## Usage

Once [deployed](#self-hosting), add this to your README — replace `your-name` with any handle you like:

```markdown
![Visitor count](https://odo.<your-account>.workers.dev/@your-name)
```

Every time the image loads, the count for `@your-name` goes up by one. Handles are case-insensitive (`@Umt` and `@umt` share a counter) and may use up to 39 letters, digits, `-` and `_`.

Prefer to click instead of type? Open `https://odo.<your-account>.workers.dev` for the builder.

## Options

Add options as query parameters, e.g. `/@your-name?icon=👀&bg=0d1117&color=58a6ff`.

### Every style

| Option | Description | Default |
| :--- | :--- | :--- |
| `theme` | `flat`, or a [theme](#themes) id | `flat` |
| `scale` | Display size multiplier, `0.1` – `10` | `1` |
| `num` | Show this number instead of counting (whole number ≥ 0) | — |
| `render` | `true` shows the current count without adding a visit | — |

### Flat

| Option | Description | Default |
| :--- | :--- | :--- |
| `icon` | Up to two characters in front of the number — emoji welcome | — |
| `bg` | Fill color: hex without `#`, or a CSS color name | `21262d` |
| `color` | Text color | `c9d1d9` |
| `stroke` | Border color | `30363d` |
| `animation` | Entrance animation: `fade`, `slide`, `pulse` or `none` | `none` |

Large numbers are shortened automatically: `1337` → `1.3K`, `1250000` → `1.3M`.

### Digit themes

| Option | Description | Default |
| :--- | :--- | :--- |
| `length` | Minimum number of digits, `1` – `16`; shorter counts are padded with zeros | `7` |
| `color` | Digit color — drawn themes only | per theme |
| `bg` | Background color — drawn themes only | per theme |
| `pixelated` | `0` turns off crisp pixel-art scaling — sprite themes only | on |

## Themes

The list is also available as JSON at `/themes`.

### Drawn

Drawn entirely in code, so they stay sharp at any size and take any colors via `color` and `bg`.

| Theme | `theme=` | Preview |
| :--- | :--- | :--- |
| Pixel | `pixel` | <img src="docs/badges/pixel.svg" alt="Pixel"> &nbsp; <img src="docs/badges/pixel-pink.svg" alt="Pixel, pink"> |
| LED | `led` | <img src="docs/badges/led.svg" alt="LED"> &nbsp; <img src="docs/badges/led-cyan.svg" alt="LED, cyan"> |
| Odometer | `odometer` | <img src="docs/badges/odometer.svg" alt="Odometer"> |
| Flip | `flip` | <img src="docs/badges/flip.svg" alt="Flip"> |

```markdown
![Visitor count](https://odo.<your-account>.workers.dev/@your-name?theme=led&length=5&color=00e5ff&bg=001018)
```

### Sprites

One character per digit, served from R2.

| Theme | `theme=` | Preview |
| :--- | :--- | :--- |
| Adventure Time | `adventuretime` | <img src="src/assets/adventuretime/2.png" height="40"><img src="src/assets/adventuretime/0.png" height="40"><img src="src/assets/adventuretime/2.png" height="40"><img src="src/assets/adventuretime/6.png" height="40"> |
| Gumball | `gumball` | <img src="src/assets/gumball/2.png" height="40"><img src="src/assets/gumball/0.png" height="40"><img src="src/assets/gumball/2.png" height="40"><img src="src/assets/gumball/6.png" height="40"> |

## Self-hosting

odo runs on your own Cloudflare account. You need [Node.js](https://nodejs.org) 18+ and a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.

```bash
# 1. Install dependencies
npm install

# 2. Sign in to Cloudflare
npx wrangler login

# 3. Create the bucket for the sprite images and upload them
npx wrangler r2 bucket create odo-sprites
npm run sprites:upload:remote

# 4. Deploy
npm run deploy
```

Wrangler prints your URL when the deploy finishes. The visit counter needs no setup: its Durable Object is created on the first deploy.

## Development

```bash
npm run sprites:upload   # copy the sprites into the local bucket (once)
npm run dev              # builder at http://localhost:8787
npm test                 # run the test suite
npm run typecheck        # type-check with tsc
```

### How it works

```
GET /@umt?theme=led
   │
   ├─ badge/options.ts      validate the handle and every option
   ├─ counter/              add a visit in the handle's Durable Object (skipped for render=true or num=)
   ├─ badge/flat.ts         draw the flat pill, or
   │  badge/glyph.ts        draw pixel / LED / odometer / flip digits, or
   │  badge/sprite.ts       lay out digit images loaded from R2 (cached in memory)
   └─ routes/badge.ts       return the SVG with no-store and CSP headers
```

### Project structure

```
src/
├── index.ts             Worker entry: exports the app and the Durable Object
├── app.ts               Route table
├── env.ts               Cloudflare bindings
├── routes/              One handler per route: badge, themes, builder page
├── badge/               Option parsing and the flat, glyph and sprite renderers
├── counter/             VisitCounter Durable Object and its client
├── themes/catalog.ts    Every theme: ids, labels, default colors, cell sizes
├── ui/                  Builder page: markup, styles and browser script
├── lib/                 Escaping and other text helpers
└── assets/              Sprite digit images, uploaded to R2
scripts/
└── upload-sprites.mjs   Uploads src/assets to R2
test/                    Vitest suites
```

### Adding a sprite theme

1. Add `0.png` … `9.png` (or `.gif`) to `src/assets/<id>/`.
2. Register the theme in `src/themes/catalog.ts`. `npm test` tells you if the cell size doesn't match the images.
3. Run `npm run sprites:upload`, and `npm run sprites:upload:remote` before deploying.

## License

[MIT](LICENSE) © 2026 Umt
