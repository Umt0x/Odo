import type { Context } from 'hono';

/** Bindings from wrangler.toml. Optional so the app also runs without them (tests). */
export interface Env {
  COUNTERS?: DurableObjectNamespace;
}

export type AppContext = Context<{ Bindings: Env }>;
