import type { Context } from 'hono';

/** Bindings from wrangler.toml. Optional so the app also runs without them (tests). */
export interface Env {
  COUNTERS?: DurableObjectNamespace;
  SPOTIFY?: DurableObjectNamespace;
  /** From the Spotify developer dashboard; set in wrangler.toml. */
  SPOTIFY_CLIENT_ID?: string;
  /** Set with `npx wrangler secret put SPOTIFY_CLIENT_SECRET`, never in a file. */
  SPOTIFY_CLIENT_SECRET?: string;
}

export type AppContext = Context<{ Bindings: Env }>;
