const MIME_TYPES = { png: 'image/png', gif: 'image/gif' } as const;

/**
 * Digit images per `theme/digit`, kept as promises for the lifetime of the isolate.
 * Caching the promise rather than the result also means concurrent requests for
 * the same digit (think `0000011`) share a single R2 read.
 */
const digitCache = new Map<string, Promise<string | null>>();

/**
 * Returns the digit image as a `data:` URI, or null when the bucket doesn't have it.
 * Misses and errors are not cached, so a digit uploaded later shows up without a redeploy.
 */
export function loadDigit(bucket: R2Bucket | undefined, theme: string, digit: string): Promise<string | null> {
  if (!bucket) return Promise.resolve(null);

  const key = `${theme}/${digit}`;
  let pending = digitCache.get(key);
  if (!pending) {
    pending = fetchDigit(bucket, key);
    digitCache.set(key, pending);
    pending.then(
      (uri) => uri ?? digitCache.delete(key),
      () => digitCache.delete(key)
    );
  }
  return pending;
}

async function fetchDigit(bucket: R2Bucket, key: string): Promise<string | null> {
  for (const ext of ['png', 'gif'] as const) {
    const object = await bucket.get(`${key}.${ext}`);
    if (object) {
      const bytes = new Uint8Array(await object.arrayBuffer());
      return `data:${MIME_TYPES[ext]};base64,${toBase64(bytes)}`;
    }
  }
  return null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
