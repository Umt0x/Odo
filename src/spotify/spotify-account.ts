import { toBase64 } from '../lib/base64.js';
import {
  exchangeCode,
  getCurrentlyPlaying,
  getProfile,
  getRecentlyPlayed,
  refreshAccessToken,
  SpotifyError,
  type Credentials,
  type PlayableItem,
} from './api.js';

interface SpotifyEnv {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
}

interface StoredAccount {
  userId: string;
  displayName: string;
  refreshToken: string;
}

export type NowPlaying =
  | { state: 'disconnected' | 'idle' | 'unavailable' }
  | {
      state: 'playing' | 'paused' | 'recent';
      title: string;
      artist: string;
      url: string | null;
      /** Cover art as a data URI, so the card works inside an <img>. */
      cover: string | null;
      progressMs: number;
      durationMs: number;
    };

/** How long a Spotify answer is reused; keeps busy READMEs well inside Spotify's rate limits. */
const NOW_PLAYING_TTL_MS = 10_000;
const COVER_CACHE_LIMIT = 20;

/**
 * Holds the connected Spotify account (one instance, `idFromName('owner')`):
 * the refresh token, a cached access token and the latest "now playing".
 *
 * `POST /connect` with `{ code, redirectUri }` finishes the OAuth flow. Once an
 * account is connected only that same account can reconnect, so nobody else can
 * take over the card. `GET /now-playing` returns a NowPlaying as JSON.
 */
export class SpotifyAccount {
  private account: StoredAccount | null = null;
  private accessToken: { value: string; expiresAt: number } | null = null;
  private latest: { value: NowPlaying; fetchedAt: number } | null = null;
  private pending: Promise<NowPlaying> | null = null;
  private readonly covers = new Map<string, string>();
  private readonly ready: Promise<void>;

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: SpotifyEnv
  ) {
    this.ready = state.blockConcurrencyWhile(async () => {
      this.account = (await state.storage.get<StoredAccount>('account')) ?? null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.ready;
    const { pathname } = new URL(request.url);

    if (pathname === '/connect' && request.method === 'POST') {
      const { code, redirectUri } = await request.json<{ code: string; redirectUri: string }>();
      return this.connect(code, redirectUri);
    }
    if (pathname === '/now-playing') {
      return Response.json(await this.nowPlaying());
    }
    return new Response('Not found', { status: 404 });
  }

  private credentials(): Credentials {
    const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = this.env;
    if (!clientId || !clientSecret) throw new Error('Spotify client ID or secret is not configured');
    return { clientId, clientSecret };
  }

  private async connect(code: string, redirectUri: string): Promise<Response> {
    try {
      return await this.completeSignIn(code, redirectUri);
    } catch (err) {
      console.error('Spotify sign-in failed:', err);
      // Tell the sign-in page why, so the owner can fix it (wrong secret, account not allowed...).
      const step = err instanceof SpotifyError ? err.code ?? `status ${err.status}` : (err as Error).message;
      return Response.json({ error: 'spotify', reason: step }, { status: 502 });
    }
  }

  private async completeSignIn(code: string, redirectUri: string): Promise<Response> {
    const tokens = await exchangeCode(this.credentials(), code, redirectUri);
    const profile = await getProfile(tokens.access_token);
    if (!profile || !tokens.refresh_token) {
      return Response.json({ error: 'Spotify did not return a profile and refresh token' }, { status: 502 });
    }
    if (this.account && this.account.userId !== profile.id) {
      return Response.json({ error: 'already-connected' }, { status: 403 });
    }

    this.account = {
      userId: profile.id,
      displayName: profile.display_name ?? profile.id,
      refreshToken: tokens.refresh_token,
    };
    await this.state.storage.put('account', this.account);
    this.accessToken = { value: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
    this.latest = null;
    return Response.json({ displayName: this.account.displayName });
  }

  private async getAccessToken(account: StoredAccount): Promise<string> {
    // Refresh a minute early so a token never expires mid-request.
    if (this.accessToken && this.accessToken.expiresAt - 60_000 > Date.now()) {
      return this.accessToken.value;
    }
    const tokens = await refreshAccessToken(this.credentials(), account.refreshToken);
    this.accessToken = { value: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
    if (tokens.refresh_token && tokens.refresh_token !== account.refreshToken) {
      account.refreshToken = tokens.refresh_token;
      await this.state.storage.put('account', account);
    }
    return tokens.access_token;
  }

  /** Cached for NOW_PLAYING_TTL_MS; concurrent callers share one Spotify round trip. */
  private nowPlaying(): Promise<NowPlaying> {
    if (this.latest && Date.now() - this.latest.fetchedAt < NOW_PLAYING_TTL_MS) {
      return Promise.resolve(this.latest.value);
    }
    this.pending ??= this.load()
      .then((value) => {
        this.latest = { value, fetchedAt: Date.now() };
        return value;
      })
      .catch((err) => {
        console.error('Could not read Spotify playback:', err);
        // A stale answer beats an error card.
        return this.latest?.value ?? { state: 'unavailable' as const };
      })
      .finally(() => {
        this.pending = null;
      });
    return this.pending;
  }

  private async load(): Promise<NowPlaying> {
    const account = this.account;
    if (!account) return { state: 'disconnected' };

    const token = await this.getAccessToken(account);
    const current = await getCurrentlyPlaying(token);
    if (current?.item) {
      return this.describe(current.item, current.is_playing ? 'playing' : 'paused', current.progress_ms ?? 0);
    }

    const recent = await getRecentlyPlayed(token);
    const last = recent?.items[0]?.track;
    return last ? this.describe(last, 'recent', 0) : { state: 'idle' };
  }

  private async describe(item: PlayableItem, state: 'playing' | 'paused' | 'recent', progressMs: number): Promise<NowPlaying> {
    const images = item.album?.images ?? item.images ?? [];
    const artist = item.artists?.map((a) => a.name).join(', ') ?? item.show?.name ?? '';
    return {
      state,
      title: item.name,
      artist,
      url: item.external_urls.spotify ?? null,
      cover: await this.cover(images),
      progressMs,
      durationMs: item.duration_ms,
    };
  }

  /** Picks an image sharp enough for a 2x screen (Spotify lists them largest first) and embeds it. */
  private async cover(images: { url: string; width: number | null }[]): Promise<string | null> {
    const image = [...images].reverse().find((img) => (img.width ?? 0) >= 128) ?? images[0];
    if (!image) return null;

    const cached = this.covers.get(image.url);
    if (cached) return cached;

    try {
      const res = await fetch(image.url);
      if (!res.ok) return null;
      const type = res.headers.get('Content-Type') ?? 'image/jpeg';
      const uri = `data:${type};base64,${toBase64(new Uint8Array(await res.arrayBuffer()))}`;
      this.covers.set(image.url, uri);
      if (this.covers.size > COVER_CACHE_LIMIT) this.covers.delete(this.covers.keys().next().value!);
      return uri;
    } catch (err) {
      console.error('Could not load cover art:', err);
      return null;
    }
  }
}
