import hatchlingDigits from '../assets/hatchling/index.js';

export type GlyphId = 'pixel' | 'led' | 'odometer' | 'flip';

/** A digit theme drawn in code (see badge/glyph.ts); recolorable with `color` and `bg`. */
export interface GlyphTheme {
  kind: 'glyph';
  id: GlyphId;
  label: string;
  colors: { foreground: string; background: string };
}

/** A digit theme made of images bundled with the worker, one per digit. */
export interface SpriteTheme {
  kind: 'sprite';
  id: string;
  label: string;
  /** Size of one digit cell: the widest and the tallest image in the set. */
  cell: { width: number; height: number };
  /** PNG bytes for the digits 0–9, in order. */
  images: readonly ArrayBuffer[];
}

export type DigitTheme = GlyphTheme | SpriteTheme;

export const GLYPH_THEMES: readonly GlyphTheme[] = [
  { kind: 'glyph', id: 'pixel', label: 'Pixel', colors: { foreground: '#39d353', background: '#0d1117' } },
  { kind: 'glyph', id: 'led', label: 'LED', colors: { foreground: '#ff453a', background: '#111111' } },
  { kind: 'glyph', id: 'odometer', label: 'Odometer', colors: { foreground: '#f5f5f5', background: '#1f2328' } },
  { kind: 'glyph', id: 'flip', label: 'Flip', colors: { foreground: '#f1f3f4', background: '#202124' } },
];

/**
 * Image themes. To add one: put `0.png` … `9.png` in `src/assets/<id>/` with an
 * `index.ts` like the existing one, and register it here. The test suite checks
 * that the cell size matches the images.
 */
export const SPRITE_THEMES: readonly SpriteTheme[] = [
  { kind: 'sprite', id: 'hatchling', label: 'Hatchlings', cell: { width: 125, height: 180 }, images: hatchlingDigits },
];

/** Every value the `theme` parameter accepts besides `flat`, in the order the builder shows them. */
export const DIGIT_THEMES: readonly DigitTheme[] = [...GLYPH_THEMES, ...SPRITE_THEMES];

const themesById = new Map<string, DigitTheme>(DIGIT_THEMES.map((theme) => [theme.id, theme]));

export function findTheme(id: string | undefined): DigitTheme | undefined {
  return id ? themesById.get(id) : undefined;
}
