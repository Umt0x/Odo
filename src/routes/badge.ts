import { renderFlatBadge } from '../badge/flat.js';
import { renderGlyphBadge } from '../badge/glyph.js';
import { renderSpriteBadge } from '../badge/sprite.js';
import { parseBadgeRequest } from '../badge/options.js';
import { ERROR_BADGE } from '../badge/svg.js';
import { countVisit } from '../counter/counter-client.js';
import type { AppContext } from '../env.js';
import { svgResponse } from '../lib/http.js';

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
    const { style, scale } = request;
    svg =
      style.kind === 'flat'
        ? renderFlatBadge(count, style, scale)
        : style.kind === 'glyph'
          ? renderGlyphBadge(count, style, scale)
          : renderSpriteBadge(count, style, scale);
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
