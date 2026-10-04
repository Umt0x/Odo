<div align="center">

# odo

**Visitor counter badges for your GitHub profile and website.**

Flat pills, retro digit styles or baby dragons, counted atomically on Cloudflare's edge — and free to host.

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

<img src="src/assets/hatchling/2.png" height="72" alt="2"><img src="src/assets/hatchling/0.png" height="72" alt="0"><img src="src/assets/hatchling/2.png" height="72" alt="2"><img src="src/assets/hatchling/6.png" height="72" alt="6">

<br><br>

[![License: MIT](https://img.shields.io/badge/license-MIT-black)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/runs%20on-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)

**[Open the badge builder →](https://odo.umt0x.workers.dev)**

[Usage](#usage) · [Options](#options) · [Themes](#themes) · [Self-hosting](#self-hosting) · [Development](#development)

<sub>This README has been viewed</sub><br>
<a href="https://odo.umt0x.workers.dev"><img src="https://odo.umt0x.workers.dev/@umt0x-odo?theme=odometer&length=6" alt="Visitor count"></a>

</div>

---

## Why odo

- **One line to add.** Paste a Markdown image into your README and you're done.
- **Accurate.** Every handle gets its own Durable Object, so simultaneous visits are never lost.
- **Six looks.** A minimal flat pill, four recolorable digit styles drawn in code — pixel, LED, odometer and flip — and the Hatchlings, ten baby dragons that each hold up a digit.
- **Builder included.** Design your badge on [the builder](https://odo.umt0x.workers.dev) and see it in a GitHub-style preview, light or dark.
- **Safe to embed.** Every input is validated, and badges are served with a strict Content-Security-Policy.
- **Free.** The Workers Free plan covers roughly 100k badge views a day.

## Usage

Add this to your README — replace `your-name` with any handle you like:

```markdown
![Visitor count](https://odo.umt0x.workers.dev/@your-name)
```

Every time the image loads, the count for `@your-name` goes up by one. Handles are case-insensitive (`@Umt` and `@umt` share a counter) and may use up to 39 letters, digits, `-` and `_`.

Prefer to click instead of type? Use [the builder](https://odo.umt0x.workers.dev): pick a style, check the preview and copy the snippet. Want your own instance? See [Self-hosting](#self-hosting).

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
| `bg` | Background color, or `transparent` — drawn themes only | per theme |
| `pixelated` | `0` turns off crisp scaling — Hatchlings only | on |

## Themes

The list is also available as JSON at `/themes`.

### Drawn

Drawn in code: they stay sharp at any size and take any colors via `color` and `bg`.

| Theme | `theme=` | Preview |
| :--- | :--- | :--- |
| Pixel | `pixel` | <img src="docs/badges/pixel.svg" alt="Pixel"> &nbsp; <img src="docs/badges/pixel-pink.svg" alt="Pixel, pink"> |
| LED | `led` | <img src="docs/badges/led.svg" alt="LED"> &nbsp; <img src="docs/badges/led-cyan.svg" alt="LED, cyan"> |
| Odometer | `odometer` | <img src="docs/badges/odometer.svg" alt="Odometer"> |
| Flip | `flip` | <img src="docs/badges/flip.svg" alt="Flip"> |

```markdown
![Visitor count](https://odo.umt0x.workers.dev/@your-name?theme=led&length=5&color=00e5ff&bg=001018)
```

### Hatchlings

Ten baby dragons — shadow, bone, panda, tabby, sand, lavender, forest, fire, ice and coral — each holding up its own digit.

| Theme | `theme=` | Preview |
| :--- | :--- | :--- |
| Hatchlings | `hatchling` | <img src="src/assets/hatchling/0.png" height="54"><img src="src/assets/hatchling/1.png" height="54"><img src="src/assets/hatchling/2.png" height="54"><img src="src/assets/hatchling/3.png" height="54"><img src="src/assets/hatchling/4.png" height="54"><img src="src/assets/hatchling/5.png" height="54"><img src="src/assets/hatchling/6.png" height="54"><img src="src/assets/hatchling/7.png" height="54"><img src="src/assets/hatchling/8.png" height="54"><img src="src/assets/hatchling/9.png" height="54"> |

```markdown
![Visitor count](https://odo.umt0x.workers.dev/@your-name?theme=hatchling&length=5)
```

## Self-hosting

odo runs on your own Cloudflare account. You need [Node.js](https://nodejs.org) 18+ and a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.

```bash
# 1. Install dependencies
npm install

# 2. Sign in to Cloudflare
npx wrangler login

# 3. Deploy
npm run deploy
```

Wrangler prints your URL when the deploy finishes. The visit counter needs no setup: its Durable Object is created on the first deploy.

## Development

```bash
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
   │  badge/sprite.ts       lay out the Hatchlings images bundled with the worker
   └─ routes/badge.ts       return the SVG with no-store and CSP headers
```

### Project structure

```
src/
├── index.ts             Worker entry: exports the app and the Durable Object
├── app.ts               Route table
├── env.ts               Cloudflare bindings
├── routes/              One handler per route: badge, themes, builder page
├── badge/               Option parsing and the flat, drawn and sprite renderers
├── counter/             VisitCounter Durable Object and its client
├── themes/catalog.ts    Every theme: ids, labels, colors and image sets
├── ui/                  Builder page: markup, styles and browser script
├── lib/                 Escaping and other text helpers
└── assets/              Sprite images (bundled into the worker)
test/                    Vitest suites
```

### Adding a theme

- **Drawn:** add a drawing function to `src/badge/glyph.ts`, register it in `DRAWERS` and in `src/themes/catalog.ts` with a label and default colors.
- **Images:** put `0.png` … `9.png` in `src/assets/<id>/` with an `index.ts` like `hatchling`'s, and register the set in `src/themes/catalog.ts`. Keep each image small (around 10 KB): every digit is embedded in the badge.

`npm test` checks that every theme renders and that image cell sizes match the files.

## License

[MIT](LICENSE) © 2026 Umt
