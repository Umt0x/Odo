import type { AppContext } from '../env.js';
import { SPRITE_THEMES } from '../themes/catalog.js';

/** GET /themes — every value the `theme` parameter accepts. */
export function themesRoute(c: AppContext): Response {
  return c.json({
    themes: [
      { id: 'flat', label: 'Flat', kind: 'flat' },
      ...SPRITE_THEMES.map(({ id, label }) => ({ id, label, kind: 'sprite' })),
    ],
  });
}
