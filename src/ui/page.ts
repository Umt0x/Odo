import { ANIMATIONS, DIGITS, FLAT_COLORS, MAX_HANDLE_LENGTH } from '../badge/options.js';
import { escapeXml } from '../lib/text.js';
import { GLYPH_THEMES, type GlyphTheme } from '../themes/catalog.js';
import { clientScript } from './client.js';
import { styles } from './styles.js';

const DEFAULT_HANDLE = 'umt';
const SAMPLE_COUNT = 2026;

const ANIMATION_LABELS: Record<(typeof ANIMATIONS)[number], string> = {
  none: 'None',
  fade: 'Fade',
  slide: 'Slide',
  pulse: 'Pulse',
};

const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' rx='8' fill='%230a0a0a'/%3E" +
  "%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%23fafafa' stroke-width='3.5'/%3E%3C/svg%3E";

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/>' +
  '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

const FILE_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>' +
  '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>';

/** Thumbnail for a style option. Uses a fixed number, so browsing styles never counts a visit. */
function sampleBadgeUrl(themeId: string | null): string {
  const params = new URLSearchParams({ num: String(SAMPLE_COUNT) });
  if (themeId) {
    params.set('theme', themeId);
    params.set('length', '4');
  }
  return `/@sample?${params}`;
}

/**
 * One card in the style picker. `data-kind` tells the browser script which
 * settings to show; drawn themes also carry their default colors.
 */
function styleOption(value: string, label: string, thumbnail: string, theme?: GlyphTheme): string {
  const kind = theme ? 'glyph' : 'flat';
  const colors = theme ? ` data-color="${theme.colors.foreground}" data-bg="${theme.colors.background}"` : '';
  return `
            <label class="style">
              <input type="radio" name="theme" value="${escapeXml(value)}" data-kind="${kind}"${colors}${kind === 'flat' ? ' checked' : ''}>
              <span class="style__thumb"><img src="${escapeXml(thumbnail)}" alt="" loading="lazy" decoding="async"></span>
              <span class="style__name">${escapeXml(label)}</span>
            </label>`;
}

function colorSwatch(name: string, label: string, value: string, onlyFor?: string): string {
  return `
                <label class="swatch"${onlyFor ? ` data-for="${onlyFor}"` : ''}>
                  <input type="color" name="${name}" value="${value}" aria-label="${label} color">
                  <span>${label}</span>
                </label>`;
}

function animationOption(name: (typeof ANIMATIONS)[number]): string {
  return `
                <label><input type="radio" name="animation" value="${name}"${name === 'none' ? ' checked' : ''}><span>${ANIMATION_LABELS[name]}</span></label>`;
}

export function renderHomePage(): string {
  const styleOptions = [
    styleOption('flat', 'Flat', sampleBadgeUrl(null)),
    ...GLYPH_THEMES.map((theme) => styleOption(theme.id, theme.label, sampleBadgeUrl(theme.id), theme)),
  ].join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Odo · Visitor counters</title>
  <meta name="description" content="Simple visitor counter badges for GitHub profiles and websites.">
  <link rel="icon" href="${FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS}">
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    <header class="header">
      <a class="logo" href="/" aria-label="Odo home"><span class="logo__mark" aria-hidden="true"></span>odo</a>
      <span class="header__by">by Umt</span>
    </header>

    <section class="hero">
      <h1>Visitor counters, done simply.</h1>
      <p>A badge for your GitHub profile or website that counts every visit. Pick a style, copy one line, done.</p>
    </section>

    <div class="workspace">
      <aside class="result" aria-label="Your badge">
        <figure class="preview" data-surface="light">
          <div class="preview__head">
            <span class="preview__file">${FILE_ICON}<span><span id="stage-handle">${DEFAULT_HANDLE}</span> / README.md</span></span>
            <div class="surface" role="group" aria-label="Preview background">
              <button type="button" data-surface-option="light" aria-pressed="true">Light</button>
              <button type="button" data-surface-option="dark" aria-pressed="false">Dark</button>
            </div>
          </div>
          <div class="preview__body">
            <p class="readme__title">Hi, I'm <span id="stage-name">${DEFAULT_HANDLE}</span></p>
            <p class="readme__text">Building things for the web. Thanks for stopping by!</p>
            <img id="stage-badge" src="/@${DEFAULT_HANDLE}?render=true" alt="Live badge preview">
          </div>
          <figcaption class="preview__foot"><span class="dot" aria-hidden="true"></span>Live preview. Updates as you edit, without counting a visit.</figcaption>
        </figure>

        <section class="section embed" aria-labelledby="embed-title">
          <div class="section__head">
            <h2 id="embed-title" class="section__title">Embed</h2>
            <div class="tabs" role="group" aria-label="Snippet format">
              <button type="button" class="tab" data-format="markdown" aria-pressed="true">Markdown</button>
              <button type="button" class="tab" data-format="html" aria-pressed="false">HTML</button>
              <button type="button" class="tab" data-format="url" aria-pressed="false">URL</button>
            </div>
          </div>
          <div class="code">
            <pre><code id="embed-code"></code></pre>
            <button type="button" id="copy" class="copy">${COPY_ICON}<span>Copy</span></button>
          </div>
        </section>
      </aside>

      <form id="builder" class="builder" data-mode="flat" data-default-handle="${DEFAULT_HANDLE}" autocomplete="off">
        <section class="section" aria-labelledby="counter-title">
          <h2 id="counter-title" class="section__title">Counter</h2>
          <div class="panel">
            <label class="row">
              <span class="row__label">Handle<small>Upper and lower case are the same.</small></span>
              <span class="input-group"><span aria-hidden="true">@</span><input name="handle" value="${DEFAULT_HANDLE}" maxlength="${MAX_HANDLE_LENGTH}" spellcheck="false" autocapitalize="off"></span>
            </label>
            <label class="row">
              <span class="row__label">Fixed number<small>Optional. Shown instead of counting.</small></span>
              <input class="input" name="num" type="number" min="0" step="1" inputmode="numeric" placeholder="Live count">
            </label>
          </div>
        </section>

        <section class="section" aria-labelledby="look-title">
          <h2 id="look-title" class="section__title">Appearance</h2>
          <div class="panel">
            <fieldset class="row row--stacked">
              <legend class="row__label">Style</legend>
              <div class="styles">${styleOptions}
              </div>
            </fieldset>

            <label class="row" data-for="flat">
              <span class="row__label">Icon<small>Up to two characters.</small></span>
              <input class="input" name="icon" maxlength="16" placeholder="e.g. 👀">
            </label>
            <fieldset class="row" data-for="flat glyph">
              <legend class="row__label">Colors</legend>
              <div class="swatches">${colorSwatch('bg', 'Fill', FLAT_COLORS.background)}${colorSwatch('color', 'Text', FLAT_COLORS.foreground)}${colorSwatch('stroke', 'Border', FLAT_COLORS.border, 'flat')}
              </div>
            </fieldset>
            <fieldset class="row" data-for="flat">
              <legend class="row__label">Animation</legend>
              <div class="segmented">${ANIMATIONS.map(animationOption).join('')}
              </div>
            </fieldset>

            <div class="row" data-for="glyph">
              <span class="row__label" id="digits-label">Digits<small>Short counts are padded with zeros.</small></span>
              <div class="stepper" role="group" aria-labelledby="digits-label">
                <button type="button" data-step="-1" aria-label="Fewer digits">−</button>
                <input name="digits" type="number" min="${DIGITS.min}" max="${DIGITS.max}" value="${DIGITS.fallback}" aria-labelledby="digits-label">
                <button type="button" data-step="1" aria-label="More digits">+</button>
              </div>
            </div>

            <label class="row">
              <span class="row__label">Size</span>
              <span class="range">
                <input name="scale" type="range" min="0.5" max="2" step="0.1" value="1">
                <output id="scale-out" class="mono">1.0×</output>
              </span>
            </label>
          </div>
        </section>

      </form>
    </div>

    <footer class="footer">
      <span>© 2026 Odo</span>
      <span>Made by Umt</span>
    </footer>
  </div>

  <script>${clientScript}</script>
</body>
</html>`;
}
