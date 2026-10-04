# Odo

Visitor counter badges for GitHub profiles and websites — a clean flat pill or a row of sprite digits. Runs on Cloudflare Workers, counts with Durable Objects and serves sprites from R2.

Made by **Umt**.

```markdown
![Visitor count](https://odo.<your-account>.workers.dev/@your-name)
```

Open the worker's root URL for the interactive builder: pick a style, tweak it and copy the snippet.

## Badge URL

```
https://odo.<your-account>.workers.dev/@<handle>?<options>
```

Every request adds one visit to `<handle>` and returns an SVG. Handles are case-insensitive (`@Umt` and `@umt` are the same counter), up to 39 characters of `a-z`, `0-9`, `-` and `_`.

### Options for every style

| Option | What it does | Default |
| :--- | :--- | :--- |
| `theme` | `flat` or a sprite theme id (see below) | `flat` |
| `scale` | Display size multiplier, `0.1` – `10` | `1` |
| `num` | Show this number instead of counting (whole number ≥ 0) | — |
| `render` | `true` shows the count without adding a visit | — |

### Flat style

| Option | What it does | Default |
| :--- | :--- | :--- |
| `icon` | Up to two characters (emoji welcome) in front of the number | — |
| `bg` | Fill color, hex without `#` or a CSS color name | `21262d` |
| `color` | Text color | `c9d1d9` |
| `stroke` | Border color | `30363d` |
| `animation` | `fade`, `slide`, `pulse` or `none` | `none` |

```markdown
![Visitor count](https://odo.<your-account>.workers.dev/@your-name?icon=👀&bg=0d1117&animation=fade)
```

### Sprite themes

`naruto`, `onepiece`, `bleach`, `dragonball`, `aot`, `codegeass`, `l`, `monster`, `adventuretime`, `gumball` — also available as JSON at `/themes`.

| Option | What it does | Default |
| :--- | :--- | :--- |
| `length` | Minimum number of digits, `1` – `16` (padded with zeros) | `7` |
| `pixelated` | `0` turns off crisp pixel-art scaling | on |

```markdown
![Visitor count](https://odo.<your-account>.workers.dev/@your-name?theme=naruto&length=5)
```

## Deploying your own

You need Node.js 18+ and a free Cloudflare account.

```bash
npm install
npx wrangler login
npx wrangler r2 bucket create odo-sprites
npm run sprites:upload:remote
npm run deploy
```

The visit counter (a Durable Object) is created automatically on the first deploy. The Workers Free plan covers roughly 100k badge views a day.

## Developing

```bash
npm run sprites:upload   # copy the sprites into the local R2 bucket (once)
npm run dev              # http://localhost:8787
npm test
npm run typecheck
```

### Project layout

```
src/
  index.ts              Worker entry: exports the app and the Durable Object
  app.ts                Routes
  env.ts                Cloudflare bindings
  routes/               One handler per route: badge, themes, home page
  badge/                Query parsing and the flat / sprite SVG renderers
  counter/              VisitCounter Durable Object and its client
  themes/catalog.ts     Sprite themes: ids, labels, cell sizes
  ui/                   Builder page: markup, styles, browser script
  lib/                  Escaping and other text helpers
  assets/               Sprite digit images, uploaded to R2
scripts/
  upload-sprites.mjs    Uploads src/assets to R2
test/                   Vitest suites
```

### Adding a sprite theme

1. Put `0.png` … `9.png` (or `.gif`) in `src/assets/<id>/`.
2. Add the theme to `src/themes/catalog.ts`; `npm test` tells you if the cell size doesn't match the images.
3. Run `npm run sprites:upload` (and `:remote` before deploying).

## License

MIT — see [LICENSE](LICENSE).
