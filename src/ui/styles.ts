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
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 400 15px/1.6 var(--font);
  -webkit-font-smoothing: antialiased;
}

button, input { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mono { font-family: var(--mono); }

.page { max-width: 1080px; margin: 0 auto; padding: 24px 16px 40px; }

/* Header */
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 64px; }
.logo {
  display: inline-flex; align-items: center; gap: 9px;
  color: var(--text); text-decoration: none;
  font-weight: 600; font-size: 1.15rem; letter-spacing: -0.03em;
}
.logo__mark {
  width: 22px; height: 22px; border-radius: 7px; background: var(--accent);
  background-image: radial-gradient(circle, transparent 4px, var(--accent-text) 4.5px, var(--accent-text) 6.5px, transparent 7px);
}
.header__by { color: var(--muted); font-size: 0.875rem; }

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
.builder[data-mode="glyph"] [data-for]:not([data-for~="glyph"]) { display: none; }

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
  display: flex; justify-content: space-between; gap: 12px;
  margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--border);
  color: var(--muted); font-size: 0.8125rem;
}

@media (min-width: 760px) {
  .page { padding: 32px 24px 56px; }
  .header { margin-bottom: 80px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
`;
