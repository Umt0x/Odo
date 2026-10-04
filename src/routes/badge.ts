import { renderFlatBadge } from '../badge/flat.js';
import { parseBadgeRequest } from '../badge/options.js';
import { renderSpriteBadge } from '../badge/sprite.js';
import { ERROR_BADGE } from '../badge/svg.js';
import { countVisit } from '../counter/counter-client.js';
import type { AppContext } from '../env.js';

/** Badges are opened directly by browsers too; this keeps any SVG from running scripts or loading remote content. */
const SVG_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";

/** Read-only badges may be served from the edge cache for this long. */
const EDGE_CACHE_SECONDS = 5;

/** GET /@:handle — counts a visit (unless `render=true`) and returns the badge. */
export async function badgeRoute(c: AppContext): Promise<Response> {
  const param = c.req.param('handle') ?? '';
  if (!param.startsWith('@')) {
    return c.notFound();
  }

  const parsed = parseBadgeRequest(param.slice(1), (name) => c.req.query(name));
  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }
  const request = parsed.value;

  // Only read-only requests may be cached; a counting request must always reach the counter.
  const edgeCache = request.readOnly && typeof caches !== 'undefined' ? caches.default : undefined;
  const cacheKey = new Request(c.req.url);
  if (edgeCache) {
    const cached = await edgeCache.match(cacheKey);
    if (cached) return cached;
  }

  const count =
    request.fixedCount ?? (await countVisit(c.env?.COUNTERS, request.handle, { readOnly: request.readOnly }));

  let svg: string;
  try {
    svg =
      request.style.kind === 'flat'
        ? renderFlatBadge(count, request.style, request.scale)
        : await renderSpriteBadge(count, request.style, request.scale, c.env?.SPRITES);
  } catch (err) {
    console.error(`Could not render badge for "${request.handle}":`, err);
    return svgResponse(ERROR_BADGE, { status: 500 });
  }

  const response = svgResponse(svg, { edgeCacheable: request.readOnly });
  if (edgeCache) {
    c.executionCtx.waitUntil(edgeCache.put(cacheKey, response.clone()));
  }
  return response;
}

function svgResponse(body: string, { status = 200, edgeCacheable = false } = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': SVG_CSP,
      // Counting badges must not be cached anywhere (GitHub's image proxy included),
      // otherwise visits would stop registering.
      'Cache-Control': edgeCacheable
        ? `public, max-age=0, s-maxage=${EDGE_CACHE_SECONDS}`
        : 'no-cache, no-store, must-revalidate',
    },
  });
}
