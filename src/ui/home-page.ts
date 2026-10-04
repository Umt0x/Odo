import type { Locale, Translate } from '../i18n/index.js';
import { escapeXml } from '../lib/text.js';
import { renderLayout } from './layout.js';

const REPO = 'https://github.com/Umt0x/Odo';

const ARROW =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/** GET / — the landing page. */
export function renderHomePage(locale: Locale, t: Translate): string {
  const e = (key: Parameters<Translate>[0]) => escapeXml(t(key));

  const body = `
    <section class="landing">
      <h1 class="wordmark" aria-label="odo"><span aria-hidden="true">o</span><span aria-hidden="true">d</span><span aria-hidden="true">o</span><i class="wordmark__dot" aria-hidden="true"></i></h1>
      <p class="landing__tagline">${e('home.tagline')}</p>
      <p class="landing__text">${e('home.text')}</p>
      <p class="landing__count">
        <img src="/@odo-home?theme=odometer&amp;length=6" alt="" height="28">
        <span>${e('home.visitors')}</span>
      </p>
    </section>

    <section class="tool-cards">
      <a class="tool-card" href="/counter">
        <span class="tool-card__art">
          <img src="/@sample?num=1337&amp;icon=%F0%9F%91%80" alt="" loading="lazy">
          <img src="/@sample?theme=led&amp;length=4&amp;num=2026" alt="" loading="lazy">
          <img src="/@sample?theme=first-ten&amp;length=3&amp;num=7" alt="" loading="lazy" class="tall">
        </span>
        <span class="tool-card__body">
          <strong>${e('nav.counter')}</strong>
          <span>${e('home.counter.text')}</span>
          <span class="tool-card__open">${e('home.open')} ${ARROW}</span>
        </span>
      </a>
      <a class="tool-card" href="/now-playing">
        <span class="tool-card__art">
          <img src="/spotify?style=compact" alt="" loading="lazy">
        </span>
        <span class="tool-card__body">
          <strong>${e('nav.spotify')}</strong>
          <span>${e('home.spotify.text')}</span>
          <span class="tool-card__open">${e('home.open')} ${ARROW}</span>
        </span>
      </a>
    </section>

    <p class="landing__source"><a href="${REPO}" target="_blank" rel="noopener">${e('home.source')} ${ARROW}</a></p>
`;

  return renderLayout({
    locale,
    t,
    page: 'home',
    title: t('meta.home.title'),
    description: t('meta.home.description'),
    body,
  });
}
