/**
 * A DurableObjectState stand-in backed by a Map. blockConcurrencyWhile runs its
 * callbacks one after another, like the real runtime does.
 */
export function fakeDurableState(storage = new Map<string, unknown>()) {
  let queue: Promise<unknown> = Promise.resolve();
  return {
    storage: {
      get: async (key: string) => storage.get(key),
      put: async (key: string, value: unknown) => {
        storage.set(key, value);
      },
    },
    blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T> {
      const run = queue.then(callback);
      queue = run.catch(() => {});
      return run;
    },
  } as unknown as DurableObjectState;
}

/** An R2 bucket stand-in that serves fixed bytes for the given keys and counts reads. */
export function fakeBucket(keys: string[], options: { failOnce?: string } = {}) {
  const available = new Set(keys);
  const reads: string[] = [];
  let failOnce = options.failOnce;

  const bucket = {
    async get(key: string) {
      reads.push(key);
      if (key === failOnce) {
        failOnce = undefined;
        throw new Error('R2 unavailable');
      }
      return available.has(key) ? { arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer } : null;
    },
  } as unknown as R2Bucket;

  return { bucket, reads };
}

/** Text content of the first <text> element, e.g. the number on a flat badge. */
export function badgeText(svg: string): string {
  return svg.match(/<text[^>]*>([^<]*)<\/text>/)?.[1].trim() ?? '';
}
