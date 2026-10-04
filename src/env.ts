import type { Context } from 'hono';

/** Bindings from wrangler.toml. Optional so the app also runs without them (tests). */
export interface Env {
  COUNTERS?: DurableObjectNamespace;
  SPRITES?: R2Bucket;
}

export type AppContext = Context<{ Bindings: Env }>;
