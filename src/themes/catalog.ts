/** A theme whose digits are images stored in R2. */
export interface SpriteTheme {
  kind: 'sprite';
  id: string;
  label: string;
  /** Size of one digit cell: the widest and the tallest digit image in the set. */
  cell: { width: number; height: number };
}

export type GlyphId = 'pixel' | 'led' | 'odometer' | 'flip';

/** A theme whose digits are drawn in code (see badge/glyph.ts); recolorable with `color` and `bg`. */
export interface GlyphTheme {
  kind: 'glyph';
  id: GlyphId;
  label: string;
  colors: { foreground: string; background: string };
}

export type DigitTheme = SpriteTheme | GlyphTheme;

export const GLYPH_THEMES: readonly GlyphTheme[] = [
  { kind: 'glyph', id: 'pixel', label: 'Pixel', colors: { foreground: '#39d353', background: '#0d1117' } },
  { kind: 'glyph', id: 'led', label: 'LED', colors: { foreground: '#ff453a', background: '#111111' } },
  { kind: 'glyph', id: 'odometer', label: 'Odometer', colors: { foreground: '#f5f5f5', background: '#1f2328' } },
  { kind: 'glyph', id: 'flip', label: 'Flip', colors: { foreground: '#f1f3f4', background: '#202124' } },
];

/**
 * Image-based themes. To add one: drop `0-9.png|gif` into `src/assets/<id>/`,
 * register it here and run `npm run sprites:upload`. The test suite checks that
 * the cell sizes below match the images on disk.
 */
export const SPRITE_THEMES: readonly SpriteTheme[] = [
  { kind: 'sprite', id: 'adventuretime', label: 'Adventure Time', cell: { width: 243, height: 330 } },
  { kind: 'sprite', id: 'gumball', label: 'Gumball', cell: { width: 245, height: 325 } },
];

/**
 * Every value the `theme` parameter accepts besides `flat`, in the order the
 * builder shows them. Doubles as the allow-list, so R2 keys are never built
 * from arbitrary input.
 */
export const DIGIT_THEMES: readonly DigitTheme[] = [...GLYPH_THEMES, ...SPRITE_THEMES];

const themesById = new Map<string, DigitTheme>(DIGIT_THEMES.map((theme) => [theme.id, theme]));

export function findTheme(id: string | undefined): DigitTheme | undefined {
  return id ? themesById.get(id) : undefined;
}

export function findSpriteTheme(id: string | undefined): SpriteTheme | undefined {
  const theme = findTheme(id);
  return theme?.kind === 'sprite' ? theme : undefined;
}
