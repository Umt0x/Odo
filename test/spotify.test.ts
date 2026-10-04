import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app.js';
import { toPixelText } from '../src/lib/pixel-font.js';
import { CARD_STYLES, parseCardOptions, renderSpotifyCard } from '../src/spotify/card.js';
import { SpotifyAccount, type NowPlaying } from '../src/spotify/spotify-account.js';
import { fakeDurableState } from './helpers.js';

const env = { SPOTIFY_CLIENT_ID: 'client-id', SPOTIFY_CLIENT_SECRET: 'client-secret' };

const track = {
  type: 'track',
  name: 'Midnight City',
  duration_ms: 240_000,
  external_urls: { spotify: 'https://open.spotify.com/track/abc' },
  artists: [{ name: 'M83' }],
  album: { name: 'Hurry Up', images: [{ url: 'https://i.scdn.co/640', width: 640 }, { url: 'https://i.scdn.co/300', width: 300 }, { url: 'https://i.scdn.co/64', width: 64 }] },
};

/** Fakes Spotify's endpoints and records which ones were called. */
function fakeSpotify(options: { userId?: string; playing?: object | null; recent?: object | null } = {}) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', async (input: RequestInfo, init?: RequestInit) => {
    const url = String(input);
    calls.push(url.replace(/\?.*/, ''));
    if (url.endsWith('/api/token')) {
      const body = new URLSearchParams(String(init?.body));
      return Response.json({ access_token: 'access', expires_in: 3600, refresh_token: body.get('grant_type') === 'authorization_code' ? 'refresh' : undefined });
    }
    if (url.endsWith('/me')) return Response.json({ id: options.userId ?? 'umt', display_name: 'Umt' });
    if (url.includes('/currently-playing')) {
      return options.playing === null ? new Response(null, { status: 204 }) : Response.json(options.playing ?? { is_playing: true, progress_ms: 60_000, item: track });
    }
    if (url.includes('/recently-played')) return Response.json({ items: options.recent ? [{ track: options.recent }] : [] });
    if (url.startsWith('https://i.scdn.co/')) return new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'image/jpeg' } });
    return new Response('unexpected', { status: 500 });
  });
  return calls;
}

async function connect(account: SpotifyAccount) {
  return account.fetch(new Request('https://spotify/connect', { method: 'POST', body: JSON.stringify({ code: 'code', redirectUri: 'https://odo/spotify/callback' }) }));
}

async function nowPlaying(account: SpotifyAccount): Promise<NowPlaying> {
  return (await account.fetch(new Request('https://spotify/now-playing'))).json();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SpotifyAccount', () => {
  it('reports disconnected until an account is connected', async () => {
    fakeSpotify();
    expect(await nowPlaying(new SpotifyAccount(fakeDurableState(), env))).toEqual({ state: 'disconnected' });
  });

  it('connects, stores the refresh token and shows the current track with its cover', async () => {
    fakeSpotify();
    const storage = new Map<string, unknown>();
    const account = new SpotifyAccount(fakeDurableState(storage), env);

    expect(await (await connect(account)).json()).toEqual({ displayName: 'Umt' });
    expect(storage.get('account')).toMatchObject({ userId: 'umt', refreshToken: 'refresh' });

    const now = await nowPlaying(account);
    expect(now).toMatchObject({ state: 'playing', title: 'Midnight City', artist: 'M83', progressMs: 60_000 });
    expect('cover' in now && now.cover).toBe('data:image/jpeg;base64,AQID');
  });

  it('only lets the same Spotify account reconnect', async () => {
    fakeSpotify({ userId: 'umt' });
    const storage = new Map<string, unknown>();
    await connect(new SpotifyAccount(fakeDurableState(storage), env));

    fakeSpotify({ userId: 'someone-else' });
    const res = await connect(new SpotifyAccount(fakeDurableState(storage), env));
    expect(res.status).toBe(403);
    expect(storage.get('account')).toMatchObject({ userId: 'umt' });
  });

  it('explains a rejected sign-in instead of crashing', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ error: 'invalid_client', error_description: 'Invalid client secret' }, { status: 400 }));
    const res = await connect(new SpotifyAccount(fakeDurableState(), env));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'spotify', reason: 'invalid_client' });
  });

  it('falls back to the last played track when nothing is playing', async () => {
    fakeSpotify({ playing: null, recent: { ...track, name: 'Wait' } });
    const account = new SpotifyAccount(fakeDurableState(), env);
    await connect(account);
    expect(await nowPlaying(account)).toMatchObject({ state: 'recent', title: 'Wait' });
  });

  it('refreshes the access token after a restart and reuses answers for a few seconds', async () => {
    const storage = new Map<string, unknown>();
    fakeSpotify();
    await connect(new SpotifyAccount(fakeDurableState(storage), env));

    const calls = fakeSpotify();
    const restarted = new SpotifyAccount(fakeDurableState(storage), env);
    await Promise.all([nowPlaying(restarted), nowPlaying(restarted), nowPlaying(restarted)]);
    await nowPlaying(restarted);

    expect(calls.filter((url) => url.endsWith('/api/token'))).toHaveLength(1);
    expect(calls.filter((url) => url.includes('/currently-playing'))).toHaveLength(1);
  });
});

describe('Spotify card', () => {
  const playing: NowPlaying = {
    state: 'playing',
    title: 'A <very> long title that will not fit on the card at all',
    artist: 'M83',
    url: null,
    cover: null,
    progressMs: 60_000,
    durationMs: 240_000,
  };

  it('escapes and shortens the title and animates while playing', () => {
    const svg = renderSpotifyCard(playing, parseCardOptions(() => undefined));
    expect(svg).toContain('A &lt;very&gt; long title');
    expect(svg).toContain('…');
    expect(svg).not.toContain('<very>');
    expect(svg).toContain('animation:progress 180s');
  });

  it('shows a message when there is nothing to show', () => {
    const light = parseCardOptions((name) => (name === 'mode' ? 'light' : undefined));
    expect(renderSpotifyCard({ state: 'disconnected' }, light)).toContain('Spotify is not connected yet');
  });

  it('reads style, colors and toggles from the query', () => {
    const query: Record<string, string> = { style: 'vinyl', bg: '000000', accent: 'ff0000', cover: '0', progress: '0', scale: '2' };
    const options = parseCardOptions((name) => query[name]);
    expect(options).toMatchObject({ style: 'vinyl', background: '#000000', accent: '#ff0000', showCover: false, showProgress: false, scale: 2 });

    const svg = renderSpotifyCard(playing, options);
    expect(svg).toContain('animation:spin');
    expect(svg).toContain('fill="#000000"');
    expect(svg).not.toContain('class="accent progress"');
  });

  it('draws a compact pill that grows with the title', () => {
    const compact = parseCardOptions((name) => (name === 'style' ? 'compact' : undefined));
    const short = renderSpotifyCard({ ...playing, title: 'Hi' }, compact);
    const long = renderSpotifyCard(playing, compact);
    const width = (svg: string) => Number(svg.match(/viewBox="0 0 ([\d.]+)/)![1]);
    expect(width(long)).toBeGreaterThan(width(short));
  });

  it('ignores unknown styles and unsafe colors', () => {
    const query: Record<string, string> = { style: 'nope', color: 'red" onload="x' };
    const options = parseCardOptions((name) => query[name]);
    expect(options.style).toBe('card');
    expect(options.foreground).toBe('#fafafa');
  });
});

describe('Spotify routes', () => {
  it('serves a card even without the Spotify binding', async () => {
    const res = await app.request('/spotify');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    expect(await res.text()).toContain('not connected');
  });

  it('starts sign-in with the read-only scopes and a state cookie', async () => {
    const res = await app.request('https://odo.test/spotify/login', {}, env);
    expect(res.status).toBe(302);

    const location = new URL(res.headers.get('Location')!);
    expect(location.origin).toBe('https://accounts.spotify.com');
    expect(location.searchParams.get('scope')).toBe('user-read-currently-playing user-read-recently-played');
    expect(location.searchParams.get('redirect_uri')).toBe('https://odo.test/spotify/callback');
    expect(res.headers.get('Set-Cookie')).toContain(`odo_spotify_state=${location.searchParams.get('state')}`);
  });

  it('refuses a callback whose state does not match', async () => {
    const res = await app.request('https://odo.test/spotify/callback?code=x&state=forged', {}, env);
    expect(res.status).toBe(400);
  });

  it('escapes the error Spotify passes back', async () => {
    const res = await app.request('https://odo.test/spotify/callback?error=%3Cscript%3E', {}, env);
    expect(await res.text()).not.toContain('<script>');
  });

  it('says when it is not configured', async () => {
    expect((await app.request('/spotify/login')).status).toBe(503);
  });
});

describe('every card style', () => {
  const track: NowPlaying = {
    state: 'playing',
    title: '<script>alert(1)</script> & a long title that keeps going',
    artist: 'Çubuklu Yaşar',
    url: null,
    cover: 'data:image/jpeg;base64,AQID',
    progressMs: 60_000,
    durationMs: 240_000,
  };

  it.each(CARD_STYLES)('%s renders a track, escaped, and the empty states', (style) => {
    const options = parseCardOptions((name) => (name === 'style' ? style : undefined));
    const svg = renderSpotifyCard(track, options);
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 [\d.]+ [\d.]+">/);
    expect(svg).not.toContain('<script>');

    for (const state of ['disconnected', 'idle', 'unavailable'] as const) {
      expect(renderSpotifyCard({ state }, options)).toMatch(/^<svg /);
    }
  });

  it('picks the mascot character from the query', () => {
    expect(parseCardOptions(() => undefined).mascot).toEqual({ set: 'dragon', digit: 7 });
    expect(parseCardOptions((name) => (name === 'mascot' ? 'robot' : undefined)).mascot).toEqual({ set: 'robot', digit: 1 });
    expect(parseCardOptions((name) => (name === 'mascot' ? 'alien-9' : undefined)).mascot).toEqual({ set: 'alien', digit: 9 });
    expect(parseCardOptions((name) => (name === 'mascot' ? 'cat-3' : undefined)).mascot).toEqual({ set: 'dragon', digit: 7 });
  });

  it('maps any text onto the LCD pixel font', () => {
    expect(toPixelText('Çubuklu Yaşar — Kostak')).toBe('CUBUKLU YASAR - KOSTAK');
    expect(toPixelText('夜に駆ける (YOASOBI)')).toBe('? (YOASOBI)');
  });
});
