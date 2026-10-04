/**
 * Last count seen per handle. If the Durable Object can't be reached, the badge
 * keeps counting from here instead of starting over at zero. Capped, with the
 * least recently used entry evicted, so random handles can't grow it forever.
 */
const lastKnown = new Map<string, number>();
const LAST_KNOWN_LIMIT = 10_000;

function remember(handle: string, count: number): void {
  lastKnown.delete(handle);
  lastKnown.set(handle, count);
  if (lastKnown.size > LAST_KNOWN_LIMIT) {
    lastKnown.delete(lastKnown.keys().next().value!);
  }
}

/**
 * Adds a visit to `handle` and returns the new count, or with `readOnly` just
 * returns the current one. Falls back to the in-memory value when the counter
 * binding is missing (tests, misconfigured deploys) or the call fails.
 */
export async function countVisit(
  counters: DurableObjectNamespace | undefined,
  handle: string,
  { readOnly }: { readOnly: boolean }
): Promise<number> {
  if (counters) {
    try {
      const stub = counters.get(counters.idFromName(handle));
      const res = await stub.fetch(`https://counter/${readOnly ? 'peek' : 'hit'}`);
      if (!res.ok) {
        throw new Error(`counter responded with ${res.status}`);
      }
      const { count } = await res.json<{ count: number }>();
      remember(handle, count);
      return count;
    } catch (err) {
      console.error(`Counter for "${handle}" unavailable, using last known value:`, err);
    }
  }

  const current = lastKnown.get(handle) ?? 0;
  if (readOnly) return current;
  remember(handle, current + 1);
  return current + 1;
}
