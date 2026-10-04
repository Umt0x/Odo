/** Badges are opened directly by browsers too; this keeps any SVG from running scripts or loading remote content. */
const SVG_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";

/** Read-only images may be served from the edge cache for this long. */
const EDGE_CACHE_SECONDS = 5;

export function svgResponse(body: string, { status = 200, edgeCacheable = false } = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': SVG_CSP,
      // Live images must not be cached anywhere, or visits stop registering and
      // cards go stale. GitHub's image proxy (camo, behind Fastly) ignores
      // no-store on its own and only stops caching with an explicit zero max-age.
      'Cache-Control': edgeCacheable
        ? `public, max-age=0, s-maxage=${EDGE_CACHE_SECONDS}`
        : 'max-age=0, s-maxage=0, no-cache, no-store, must-revalidate',
      ...(edgeCacheable ? {} : { Expires: '0' }),
    },
  });
}
