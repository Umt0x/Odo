import { PATTERN_DARK, PATTERN_LIGHT } from './pattern.js';

export const styles = String.raw`
*, *::before, *::after { box-sizing: border-box; }

:root {
  color-scheme: light dark;
  --bg: #fafafa;
  --surface: #ffffff;
  --subtle: #f4f4f5;
  --text: #0a0a0a;
  --muted: #71717a;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --accent: #0a0a0a;
  --accent-text: #fafafa;
  --ring: rgba(10, 10, 10, 0.1);
  --success: #16a34a;
  --font: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono: 'Geist Mono', ui-monospace, SFMono-Regular, Consolas, monospace;
  --pattern: ${PATTERN_LIGHT};
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #09090b;
    --surface: #111113;
    --subtle: #18181b;
    --text: #fafafa;
    --muted: #a1a1aa;
    --border: #27272a;
    --border-strong: #3f3f46;
    --accent: #fafafa;
    --accent-text: #09090b;
    --ring: rgba(250, 250, 250, 0.14);
    --success: #22c55e;
    --pattern: ${PATTERN_DARK};
  }
}

body {
  margin: 0;
  background: var(--bg) var(--pattern);
  background-size: 320px 320px;
  color: var(--text);
  font: 400 15px/1.6 var(--font);
  -webkit-font-smoothing: antialiased;
}

button, input { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mono { font-family: var(--mono); }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.page { max-width: 1080px; margin: 0 auto; padding: 24px 16px 40px; }

/* Header */
.header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 56px; view-transition-name: header; }
.logo {
  display: inline-flex; align-items: center; gap: 9px;
  color: var(--text); text-decoration: none;
  font-weight: 600; font-size: 1.15rem; letter-spacing: -0.03em;
}
.logo__mark {
  width: 22px; height: 22px; border-radius: 7px; background: var(--accent);
  background-image: radial-gradient(circle, transparent 4px, var(--accent-text) 4.5px, var(--accent-text) 6.5px, transparent 7px);
}
/* Tool switcher: the active pill slides between tabs when changing pages (view transitions). */
.tools {
  display: inline-flex; gap: 2px; padding: 3px; border-radius: 999px;
  border: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 85%, transparent);
  backdrop-filter: blur(6px);
}
.tools a {
  position: relative; isolation: isolate; padding: 6px 14px; border-radius: 999px;
  color: var(--muted); font-size: 0.875rem; font-weight: 500; text-decoration: none; white-space: nowrap;
  transition: color 0.15s ease;
}
.tools a:hover { color: var(--text); }
.tools a[aria-current="page"] { color: var(--accent-text); }
.tools__pill { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: var(--accent); view-transition-name: tool-pill; }

/* Page changes cross-fade; the header stays put. */
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: 160ms ease both vt-out; }
::view-transition-new(root) { animation: 260ms cubic-bezier(.2,.8,.2,1) both vt-in; }
::view-transition-group(tool-pill) { animation-duration: 320ms; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
@keyframes vt-out { to { opacity: 0; } }
@keyframes vt-in { from { opacity: 0; transform: translateY(8px); } }

/* Hero */
.hero { max-width: 640px; margin-bottom: 40px; }
.hero h1 { margin: 0 0 10px; font-size: clamp(1.9rem, 6vw, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.035em; }
.hero p { margin: 0; max-width: 32rem; color: var(--muted); font-size: 1rem; }

/* Layout: settings on the left, the result (preview + embed) on the right */
.workspace { display: flex; flex-direction: column; gap: 32px; }
.result { display: contents; }
.preview { order: 1; }
.builder { order: 2; }
.embed { order: 3; }

@media (min-width: 1024px) {
  .workspace { display: grid; grid-template-columns: minmax(0, 1fr) 400px; align-items: start; gap: 40px; }
  .result { display: grid; gap: 28px; order: 2; position: sticky; top: 24px; }
  .builder { order: 1; }
}

/* Preview: the badge inside a mock GitHub README */
.preview {
  --readme-bg: #ffffff;
  --readme-text: #1f2328;
  --readme-muted: #59636e;
  --readme-border: #d1d9e0;
  margin: 0; overflow: hidden;
  border: 1px solid var(--border); border-radius: 16px; background: var(--surface);
}
.preview[data-surface="dark"] {
  --readme-bg: #0d1117;
  --readme-text: #f0f6fc;
  --readme-muted: #9198a1;
  --readme-border: #3d444d;
}
.preview__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 12px 10px 16px; border-bottom: 1px solid var(--border);
}
.preview__file { display: inline-flex; align-items: center; gap: 8px; min-width: 0; color: var(--muted); font: 400 0.8125rem var(--mono); }
.preview__file > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview__file #stage-handle { color: var(--text); }
.surface { display: inline-flex; flex-shrink: 0; padding: 2px; border-radius: 8px; background: var(--subtle); }
.surface button { padding: 3px 9px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); font-size: 0.75rem; font-weight: 500; cursor: pointer; }
.surface button[aria-pressed="true"] { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border); }
.preview__body {
  padding: 22px 24px 26px; background: var(--readme-bg); color: var(--readme-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  transition: background 0.2s ease, color 0.2s ease;
}
.readme__title {
  margin: 0 0 10px; padding-bottom: 8px; border-bottom: 1px solid var(--readme-border);
  font-size: 1.35rem; font-weight: 600; line-height: 1.25;
  overflow-wrap: anywhere;
}
.readme__text { margin: 0 0 16px; color: var(--readme-muted); font-size: 0.875rem; }
.preview__body img { display: block; max-width: 100%; max-height: 120px; }
.preview__foot {
  display: flex; align-items: center; gap: 8px; padding: 9px 16px;
  border-top: 1px solid var(--border); color: var(--muted); font-size: 0.75rem;
}
.dot { flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 20%, transparent); }

/* Sections & panels */
.builder { display: grid; gap: 32px; }
.section__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.section__title { margin: 0 0 10px; font-size: 0.8125rem; font-weight: 500; color: var(--muted); }
.section__head .section__title { margin: 0; }
.panel { border: 1px solid var(--border); border-radius: 14px; background: var(--surface); }

.row {
  display: grid; gap: 10px; align-items: center;
  margin: 0; padding: 16px 18px; min-width: 0;
  border: 0; border-top: 1px solid var(--border);
}
.row:first-child { border-top: 0; }
.row__label { float: left; padding: 0; font-weight: 500; font-size: 0.875rem; }
.row__label small { display: block; margin-top: 1px; color: var(--muted); font-size: 0.8125rem; font-weight: 400; }
.row--stacked > .row__label { margin-bottom: 12px; }
.row--stacked > :not(legend) { clear: both; }

/* Settings only apply to some styles: data-for lists them, data-mode is the current one. */
.builder[data-mode="flat"] [data-for]:not([data-for~="flat"]),
.builder[data-mode="glyph"] [data-for]:not([data-for~="glyph"]),
.builder[data-mode="sprite"] [data-for]:not([data-for~="sprite"]),
.builder[data-mode="card"] [data-for]:not([data-for~="card"]),
.builder[data-mode="compact"] [data-for]:not([data-for~="compact"]),
.builder[data-mode="vinyl"] [data-for]:not([data-for~="vinyl"]) { display: none; }

@media (min-width: 600px) {
  .row:not(.row--stacked) { grid-template-columns: 180px minmax(0, 1fr); gap: 24px; }
}

/* Inputs */
.input, .input-group {
  width: 100%; max-width: 320px; height: 38px;
  border: 1px solid var(--border); border-radius: 8px; background: var(--surface);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input { padding: 0 12px; font-size: 0.875rem; }
.input::placeholder { color: var(--muted); }
.input:hover, .input-group:hover { border-color: var(--border-strong); }
.input:focus, .input-group:focus-within { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
.input-group { display: flex; align-items: center; overflow: hidden; }
.input-group > span { padding-left: 12px; color: var(--muted); font-size: 0.875rem; }
.input-group input { flex: 1; min-width: 0; height: 100%; padding: 0 12px 0 2px; border: 0; outline: none; background: transparent; font-size: 0.875rem; }

/* Style picker */
.styles { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }
.style {
  position: relative; display: grid; gap: 6px; padding: 6px 6px 8px; cursor: pointer;
  border: 1px solid var(--border); border-radius: 10px; background: var(--surface);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.style:hover { border-color: var(--border-strong); }
.style input { position: absolute; opacity: 0; pointer-events: none; }
.style:has(input:checked) { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.style:has(input:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
.style__thumb { display: grid; place-items: center; height: 52px; padding: 6px; border-radius: 6px; background: var(--subtle); overflow: hidden; }
.style__thumb img { max-width: 100%; max-height: 100%; }
.style__name { color: var(--muted); font-size: 0.78rem; text-align: center; }
.style:has(input:checked) .style__name { color: var(--text); font-weight: 500; }

/* Colors */
.swatches { display: flex; gap: 16px; }
.swatch { display: grid; justify-items: center; gap: 4px; color: var(--muted); font-size: 0.75rem; cursor: pointer; }
.swatch input {
  width: 30px; height: 30px; padding: 0; cursor: pointer;
  border: 1px solid var(--border-strong); border-radius: 50%; background: none;
  -webkit-appearance: none; appearance: none;
}
.swatch input::-webkit-color-swatch-wrapper { padding: 2px; }
.swatch input::-webkit-color-swatch { border: 0; border-radius: 50%; }
.swatch input::-moz-color-swatch { border: 0; border-radius: 50%; }

/* Segmented control */
.segmented { display: inline-flex; flex-wrap: wrap; gap: 2px; width: max-content; max-width: 100%; padding: 3px; border-radius: 9px; background: var(--subtle); }
.segmented label { position: relative; }
.segmented input { position: absolute; opacity: 0; }
.segmented span { display: block; padding: 5px 12px; border-radius: 6px; color: var(--muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: color 0.15s ease; }
.segmented span:hover { color: var(--text); }
.segmented input:checked + span { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border); }
.segmented input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 1px; }

/* Stepper */
.stepper { display: inline-flex; width: max-content; height: 38px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.stepper button { width: 36px; border: 0; background: transparent; color: var(--muted); font-size: 1.05rem; cursor: pointer; }
.stepper button:hover { background: var(--subtle); color: var(--text); }
.stepper input {
  width: 48px; border: 0; border-inline: 1px solid var(--border); background: transparent;
  text-align: center; font-family: var(--mono); font-size: 0.875rem;
  -moz-appearance: textfield; appearance: textfield;
}
.stepper input::-webkit-inner-spin-button, .stepper input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

/* Switch */
.switch { position: relative; display: inline-flex; width: max-content; cursor: pointer; }
.switch input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.switch__track { position: relative; width: 36px; height: 20px; border-radius: 999px; background: var(--border-strong); transition: background 0.2s ease; }
.switch__track::after {
  content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: transform 0.2s ease;
}
.switch input:checked + .switch__track { background: var(--accent); }
.switch input:checked + .switch__track::after { transform: translateX(16px); background: var(--accent-text); }
.switch input:focus-visible + .switch__track { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Range */
.range { display: flex; align-items: center; gap: 14px; max-width: 320px; }
.range input { flex: 1; accent-color: var(--accent); }
.range output { min-width: 3.5ch; color: var(--muted); font-size: 0.8125rem; }

/* Embed */
.tabs { display: inline-flex; gap: 2px; }
.tab { padding: 4px 10px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; }
.tab:hover { color: var(--text); }
.tab[aria-pressed="true"] { background: var(--subtle); color: var(--text); }
.code { position: relative; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); }
.code pre {
  margin: 0; padding: 16px 96px 16px 18px; max-height: 10em; overflow: auto;
  font: 400 0.8125rem/1.65 var(--mono); white-space: pre-wrap; word-break: break-all;
}
.copy {
  position: absolute; top: 10px; right: 10px;
  display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px;
  border: 1px solid var(--border); border-radius: 7px; background: var(--surface);
  font-size: 0.8125rem; font-weight: 500; cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.copy:hover { background: var(--subtle); border-color: var(--border-strong); }
.copy.is-done { color: var(--success); border-color: color-mix(in srgb, var(--success) 40%, var(--border)); }

/* Footer */
.footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--border);
  color: var(--muted); font-size: 0.8125rem;
}
.language { margin: 0; }
.language label { display: inline-flex; align-items: center; gap: 6px; }
.language select {
  -webkit-appearance: none; appearance: none; cursor: pointer;
  padding: 4px 26px 4px 10px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2371717a' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 9px center;
  color: var(--text); font: inherit;
}
[dir="rtl"] .language select { padding: 4px 10px 4px 26px; background-position: left 9px center; }
.made-by { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); text-decoration: none; }
.made-by strong { color: var(--text); font-weight: 600; }
.made-by:hover strong { text-decoration: underline; }

/* Landing */
.landing { padding: 8px 0 48px; text-align: center; }
.wordmark {
  display: inline-flex; align-items: flex-end; margin: 0;
  font-size: clamp(5.5rem, 24vw, 11.5rem); font-weight: 700; line-height: 0.85; letter-spacing: -0.075em;
}
.wordmark span { display: inline-block; animation: rise 0.8s cubic-bezier(.2,.8,.2,1) both; }
.wordmark span:nth-child(2) { animation-delay: 0.08s; }
.wordmark span:nth-child(3) { animation-delay: 0.16s; }
.wordmark__dot {
  width: 0.15em; height: 0.15em; margin: 0 0 0.11em 0.06em; border-radius: 50%; background: var(--success);
  animation: rise 0.8s 0.26s cubic-bezier(.2,.8,.2,1) both, glow 2.4s 1.2s ease-in-out infinite;
}
@keyframes rise { from { opacity: 0; transform: translateY(0.35em); } }
@keyframes glow { 50% { box-shadow: 0 0 0 0.08em color-mix(in srgb, var(--success) 25%, transparent); } }
.landing__tagline { margin: 22px 0 8px; font-size: clamp(1.25rem, 3.6vw, 1.65rem); font-weight: 600; letter-spacing: -0.025em; }
.landing__text { max-width: 34rem; margin: 0 auto 26px; color: var(--muted); }
.landing__count {
  display: inline-flex; align-items: center; gap: 10px; margin: 0; padding: 5px 14px 5px 5px;
  border: 1px solid var(--border); border-radius: 999px; background: var(--surface);
  color: var(--muted); font-size: 0.8125rem;
}
.landing__count img { display: block; border-radius: 6px; }
.tool-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; max-width: 880px; margin: 0 auto; }
.tool-card {
  display: grid; overflow: hidden; color: inherit; text-decoration: none;
  border: 1px solid var(--border); border-radius: 18px; background: var(--surface);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.tool-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: 0 16px 32px -18px rgba(0, 0, 0, 0.3); }
.tool-card__art {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px;
  min-height: 160px; padding: 24px; border-bottom: 1px solid var(--border);
  background: var(--subtle); background-image: radial-gradient(var(--border-strong) 1px, transparent 1px); background-size: 18px 18px;
}
.tool-card__art img { display: block; max-width: 100%; height: auto; max-height: 40px; }
.tool-card__art img.tall { max-height: 76px; }
.tool-card__body { display: grid; gap: 6px; padding: 18px 20px 20px; }
.tool-card__body strong { font-size: 1.05rem; font-weight: 600; }
.tool-card__body > span:not(.tool-card__open) { color: var(--muted); font-size: 0.9rem; }
.tool-card__open { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 0.875rem; font-weight: 500; }
.tool-card .arrow { transition: transform 0.2s ease; }
.tool-card:hover .arrow { transform: translateX(3px); }
[dir="rtl"] .arrow { transform: scaleX(-1); }
[dir="rtl"] .tool-card:hover .arrow { transform: scaleX(-1) translateX(3px); }
.landing__source { margin: 32px 0 0; text-align: center; }
.landing__source a { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.875rem; text-decoration: none; }
.landing__source a:hover { color: var(--text); }

/* Spotify builder bits */
.styles--wide { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.note { padding: 16px 18px; }
.note p { margin: 0 0 8px; color: var(--muted); font-size: 0.875rem; }
.note p:last-child { margin: 0; }

@media (min-width: 760px) {
  .page { padding: 32px 24px 56px; }
  .header { margin-bottom: 80px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
`;
