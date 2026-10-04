import { getCookie, setCookie } from 'hono/cookie';
import type { AppContext } from '../env.js';
import { DEFAULT_LOCALE, findLocale, LOCALE_COOKIE, negotiateLocale, translator, type Locale } from '../i18n/index.js';
import { renderCounterPage } from '../ui/counter-page.js';
import { renderHomePage } from '../ui/home-page.js';
import { renderSpotifyPage } from '../ui/spotify-page.js';

/** Remembered choice first, then the browser's languages, then English. */
function resolveLocale(c: AppContext): Locale {
  return findLocale(getCookie(c, LOCALE_COOKIE)) ?? negotiateLocale(c.req.header('Accept-Language')) ?? DEFAULT_LOCALE;
}

/**
 * `?lang=xx` from the footer's picker: remember it for a year and redirect to
 * the same page without the parameter, so shared links stay clean.
 */
function handleLanguageSwitch(c: AppContext): Response | null {
  const requested = c.req.query('lang');
  if (requested === undefined) return null;

  const locale = findLocale(requested);
  if (locale) {
    setCookie(c, LOCALE_COOKIE, locale.code, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'Lax', secure: true });
  }
  const url = new URL(c.req.url);
  url.searchParams.delete('lang');
  return c.redirect(url.pathname + url.search, 302);
}

/** Pages only depend on the language, so each is built once per isolate and language. */
const cache = new Map<string, string>();

function cached(key: string, build: () => string): string {
  let html = cache.get(key);
  if (!html) {
    html = build();
    cache.set(key, html);
  }
  return html;
}

function page(c: AppContext, html: string): Response {
  c.header('Vary', 'Cookie, Accept-Language');
  return c.html(html);
}

/** GET / — the landing page. */
export function homeRoute(c: AppContext): Response {
  const locale = resolveLocale(c);
  return handleLanguageSwitch(c) ?? page(c, cached(`home:${locale.code}`, () => renderHomePage(locale, translator(locale))));
}

/** GET /counter — the visitor counter builder. */
export function counterRoute(c: AppContext): Response {
  const locale = resolveLocale(c);
  return handleLanguageSwitch(c) ?? page(c, cached(`counter:${locale.code}`, () => renderCounterPage(locale, translator(locale))));
}

/** GET /now-playing — the Spotify card builder. Shows the connected account's name in the preview. */
export async function spotifyPageRoute(c: AppContext): Promise<Response> {
  const redirect = handleLanguageSwitch(c);
  if (redirect) return redirect;

  let owner = 'odo';
  const ns = c.env?.SPOTIFY;
  if (ns) {
    try {
      const res = await ns.get(ns.idFromName('owner')).fetch('https://spotify/profile');
      owner = (await res.json<{ displayName: string | null }>()).displayName ?? owner;
    } catch (err) {
      console.error('Could not read the Spotify profile:', err);
    }
  }

  const locale = resolveLocale(c);
  return page(c, renderSpotifyPage(locale, translator(locale), owner));
}
