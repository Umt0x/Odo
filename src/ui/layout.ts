import { LOCALES, type Locale, type MessageKey, type Translate } from '../i18n/index.js';
import { escapeXml } from '../lib/text.js';
import { sharedScript } from './scripts/shared.js';
import { styles } from './styles.js';

export type Page = 'home' | 'counter' | 'spotify';

const TOOLS: { id: Page; href: string; label: MessageKey }[] = [
  { id: 'counter', href: '/counter', label: 'nav.counter' },
  { id: 'spotify', href: '/now-playing', label: 'nav.spotify' },
];

const GITHUB_PROFILE = 'https://github.com/Umt0x';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' rx='8' fill='%230a0a0a'/%3E" +
  "%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%23fafafa' stroke-width='3.5'/%3E%3C/svg%3E";

const GLOBE_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/>' +
  '<path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>';

const GITHUB_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.2-3.1-.1-.4-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg>';

interface LayoutOptions {
  locale: Locale;
  t: Translate;
  page: Page;
  title: string;
  description: string;
  /** Page markup between the header and the footer. Trusted. */
  body: string;
  /** The page's own browser script; runs after the shared helpers. */
  script?: string;
}

/** The frame every page shares: head, header with the tool switcher, footer with the language picker. */
export function renderLayout({ locale, t, page, title, description, body, script = '' }: LayoutOptions): string {
  const nav = TOOLS.map(
    (tool) =>
      tool.id === page
        ? `<a href="${tool.href}" aria-current="page"><span class="tools__pill" aria-hidden="true"></span>${escapeXml(t(tool.label))}</a>`
        : `<a href="${tool.href}">${escapeXml(t(tool.label))}</a>`
  ).join('');

  const languages = LOCALES.map(
    (l) => `<option value="${l.code}"${l.code === locale.code ? ' selected' : ''}>${escapeXml(l.name)}</option>`
  ).join('');

  return `<!doctype html>
<html lang="${locale.code}" dir="${locale.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeXml(title)}</title>
  <meta name="description" content="${escapeXml(description)}">
  <link rel="icon" href="${FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS}">
  <style>${styles}</style>
</head>
<body data-page="${page}">
  <div class="page">
    <header class="header">
      <a class="logo" href="/" aria-label="${escapeXml(t('nav.home'))}"><span class="logo__mark" aria-hidden="true"></span>odo</a>
      <nav class="tools" aria-label="${escapeXml(t('nav.tools'))}">${nav}</nav>
    </header>
${body}
    <footer class="footer">
      <span>© 2026 Odo</span>
      <form class="language" method="get">
        <label>${GLOBE_ICON}<span class="sr-only">${escapeXml(t('footer.language'))}</span>
          <select name="lang" data-autosubmit>${languages}</select>
        </label>
        <noscript><button type="submit">OK</button></noscript>
      </form>
      <a class="made-by" href="${GITHUB_PROFILE}" target="_blank" rel="noopener">${GITHUB_ICON}${escapeXml(t('footer.madeBy'))} <strong>Umt0x</strong></a>
    </footer>
  </div>

  <script>${sharedScript}</script>
  ${script ? `<script>${script}</script>` : ''}
</body>
</html>`;
}
