import { getCookie, setCookie } from 'hono/cookie';
import type { AppContext } from '../env.js';
import { svgResponse } from '../lib/http.js';
import { escapeXml } from '../lib/text.js';
import { authorizeUrl } from '../spotify/api.js';
import { parseCardOptions, renderSpotifyCard } from '../spotify/card.js';
import type { NowPlaying } from '../spotify/spotify-account.js';

const STATE_COOKIE = 'odo_spotify_state';

/** There is a single connected account per deployment: the owner's. */
function account(c: AppContext): DurableObjectStub | null {
  const ns = c.env?.SPOTIFY;
  return ns ? ns.get(ns.idFromName('owner')) : null;
}

async function nowPlaying(c: AppContext): Promise<NowPlaying> {
  const stub = account(c);
  if (!stub) return { state: 'disconnected' };
  try {
    const res = await stub.fetch('https://spotify/now-playing');
    return await res.json<NowPlaying>();
  } catch (err) {
    console.error('Spotify account unavailable:', err);
    return { state: 'unavailable' };
  }
}

/**
 * GET /spotify — the "now playing" card. Options: `style` (card, compact, vinyl),
 * `mode` (dark, light), `bg`, `color`, `accent`, `cover=0`, `progress=0`, `scale`.
 */
export async function spotifyCardRoute(c: AppContext): Promise<Response> {
  const options = parseCardOptions((name) => c.req.query(name));
  return svgResponse(renderSpotifyCard(await nowPlaying(c), options));
}

/** GET /spotify/open — redirects to the song on the card, so the card can be a link. */
export async function spotifyOpenRoute(c: AppContext): Promise<Response> {
  const now = await nowPlaying(c);
  const url = 'url' in now && now.url ? now.url : 'https://open.spotify.com';
  return c.redirect(url, 302);
}

/** GET /spotify/login — starts the Spotify sign-in that connects the owner's account. */
export function spotifyLoginRoute(c: AppContext): Response {
  const clientId = c.env?.SPOTIFY_CLIENT_ID;
  if (!clientId || !c.env?.SPOTIFY_CLIENT_SECRET) {
    return page(c, 'Spotify is not set up', 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to this worker first.', 503);
  }

  // Ties the callback to this browser, so nobody can complete a sign-in they didn't start.
  const state = crypto.randomUUID();
  setCookie(c, STATE_COOKIE, state, { path: '/spotify', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 600 });
  return c.redirect(authorizeUrl(clientId, callbackUrl(c), state), 302);
}

/** GET /spotify/callback — Spotify sends the browser back here after sign-in. */
export async function spotifyCallbackRoute(c: AppContext): Promise<Response> {
  const { code, state, error } = c.req.query();
  if (error) {
    return page(c, 'Spotify was not connected', `Spotify said: ${escapeXml(error)}.`, 400);
  }
  if (!code || !state || state !== getCookie(c, STATE_COOKIE)) {
    return page(c, 'Sign-in expired', 'Start again from /spotify/login.', 400);
  }
  setCookie(c, STATE_COOKIE, '', { path: '/spotify', maxAge: 0 });

  const stub = account(c);
  if (!stub) return page(c, 'Spotify is not set up', 'The SPOTIFY binding is missing from this worker.', 503);

  let res: Response;
  try {
    res = await stub.fetch('https://spotify/connect', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri: callbackUrl(c) }),
    });
  } catch (err) {
    console.error('Spotify account unavailable:', err);
    return page(c, 'Could not connect', 'Something went wrong on our side. Try again from /spotify/login.', 502);
  }
  if (res.status === 403) {
    return page(c, 'Already connected', 'This Odo is connected to a different Spotify account.', 403);
  }
  if (!res.ok) {
    const { reason } = await res.json<{ reason?: string }>().catch(() => ({ reason: undefined }));
    return page(c, 'Could not connect', `${explain(reason)} Then try again from <a href="/spotify/login">/spotify/login</a>.`, 502);
  }

  const { displayName } = await res.json<{ displayName: string }>();
  const origin = new URL(c.req.url).origin;
  const snippet = `[![Spotify](${origin}/spotify)](${origin}/spotify/open)`;
  return page(
    c,
    `Connected as ${displayName}`,
    `Add this to your README, or <a href="/now-playing">customize the card first</a>:<pre>${escapeXml(snippet)}</pre><img src="/spotify" alt="Now playing" width="400">`
  );
}

/** Turns Spotify's error code into what the owner should do about it. */
function explain(reason: string | undefined): string {
  if (reason === 'invalid_client') {
    return 'Spotify rejected the client secret. Copy the current one from the Spotify dashboard and save it again with <code>npx wrangler secret put SPOTIFY_CLIENT_SECRET</code>.';
  }
  if (reason === 'invalid_grant') {
    return 'The sign-in code expired or was already used.';
  }
  if (reason && /registered|developer|user/i.test(reason)) {
    return 'This Spotify account is not allowed to use the app yet. Add it under User Management in the Spotify dashboard.';
  }
  return `Spotify said: <code>${escapeXml(reason ?? 'unknown error')}</code>.`;
}

function callbackUrl(c: AppContext): string {
  return new URL('/spotify/callback', c.req.url).href;
}

/** A small standalone page for the sign-in flow. `body` is trusted markup. */
function page(c: AppContext, title: string, body: string, status: 200 | 400 | 403 | 502 | 503 = 200): Response {
  return c.html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<title>${escapeXml(title)} · Odo</title>` +
      `<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fafafa;color:#0a0a0a;font:15px/1.6 system-ui,sans-serif}` +
      `main{max-width:460px;padding:32px}h1{font-size:1.4rem;margin:0 0 8px}pre{white-space:pre-wrap;word-break:break-all;background:#f4f4f5;padding:12px;border-radius:8px;font-size:13px}` +
      `@media (prefers-color-scheme:dark){body{background:#09090b;color:#fafafa}pre{background:#18181b}}</style></head>` +
      `<body><main><h1>${escapeXml(title)}</h1><p>${body}</p></main></body></html>`,
    status
  );
}
