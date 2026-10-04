const ACCOUNTS_URL = 'https://accounts.spotify.com';
const API_URL = 'https://api.spotify.com/v1';

/** Read-only access to what is playing now and what played last; nothing else. */
export const SCOPES = 'user-read-currently-playing user-read-recently-played';

export interface Credentials {
  clientId: string;
  clientSecret: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  /** Sent on the first exchange; on refresh only when Spotify rotates it. */
  refresh_token?: string;
}

export interface SpotifyImage {
  url: string;
  width: number | null;
}

/** The fields we use of a track or podcast episode. */
export interface PlayableItem {
  type: 'track' | 'episode';
  name: string;
  duration_ms: number;
  external_urls: { spotify?: string };
  artists?: { name: string }[];
  album?: { name: string; images: SpotifyImage[] };
  show?: { name: string };
  images?: SpotifyImage[];
}

export interface CurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number | null;
  item: PlayableItem | null;
}

export class SpotifyError extends Error {
  /** Spotify's short error code, e.g. `invalid_client` or `invalid_grant`, when it sent one. */
  readonly code: string | undefined;

  constructor(
    readonly status: number,
    detail: string
  ) {
    super(`Spotify responded with ${status}: ${detail}`);
    this.code = parseErrorCode(detail);
  }
}

/** Token errors look like `{"error":"invalid_client"}`, Web API errors like `{"error":{"message":"..."}}`. */
function parseErrorCode(detail: string): string | undefined {
  try {
    const { error } = JSON.parse(detail) as { error?: string | { message?: string } };
    return typeof error === 'string' ? error : error?.message;
  } catch {
    return undefined;
  }
}

export function authorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return `${ACCOUNTS_URL}/authorize?${params}`;
}

async function requestToken(credentials: Credentials, params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new SpotifyError(res.status, await res.text());
  return res.json<TokenResponse>();
}

export function exchangeCode(credentials: Credentials, code: string, redirectUri: string): Promise<TokenResponse> {
  return requestToken(credentials, { grant_type: 'authorization_code', code, redirect_uri: redirectUri });
}

export function refreshAccessToken(credentials: Credentials, refreshToken: string): Promise<TokenResponse> {
  return requestToken(credentials, { grant_type: 'refresh_token', refresh_token: refreshToken });
}

/** GET from the Web API; resolves to null for "204 No Content" (e.g. nothing playing). */
async function get<T>(accessToken: string, path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 204) return null;
  if (!res.ok) throw new SpotifyError(res.status, await res.text());
  return res.json<T>();
}

export function getProfile(accessToken: string) {
  return get<{ id: string; display_name: string | null }>(accessToken, '/me');
}

export function getCurrentlyPlaying(accessToken: string) {
  return get<CurrentlyPlaying>(accessToken, '/me/player/currently-playing?additional_types=episode');
}

export function getRecentlyPlayed(accessToken: string) {
  return get<{ items: { track: PlayableItem }[] }>(accessToken, '/me/player/recently-played?limit=1');
}
