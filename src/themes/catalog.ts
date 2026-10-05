import aliensDigits from '../assets/umt0x-aliens-0-9/index.js';
import elementCatsDigits from '../assets/umt0x-element-cats/index.js';
import firstBootDigits from '../assets/umt0x-first-boot/index.js';
import firstTenDigits from '../assets/umt0x-th-first-ten/index.js';
import forestSpiritsDigits from '../assets/umt0x-forest-spirits/index.js';
import livingObjectsDigits from '../assets/umt0x-living-objects/index.js';
import pocketMonstersDigits from '../assets/umt0x-pocket-monsters/index.js';

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
 * Image themes. To add one: put `0.png` … `9.png` in a folder under `src/assets/`
 * with an `index.ts` like the existing ones, and register it here. The test suite checks
 * that the cell size matches the images.
 */
export const SPRITE_THEMES: readonly SpriteTheme[] = [
  { kind: 'sprite', id: 'first-ten', label: 'The First Ten', cell: { width: 125, height: 180 }, images: firstTenDigits },
  { kind: 'sprite', id: 'first-boot', label: 'First Boot', cell: { width: 133, height: 180 }, images: firstBootDigits },
  { kind: 'sprite', id: 'aliens', label: 'Aliens', cell: { width: 135, height: 180 }, images: aliensDigits },
  { kind: 'sprite', id: 'element-cats', label: 'Element Cats', cell: { width: 127, height: 180 }, images: elementCatsDigits },
  { kind: 'sprite', id: 'forest-spirits', label: 'Forest Spirits', cell: { width: 133, height: 180 }, images: forestSpiritsDigits },
  { kind: 'sprite', id: 'living-objects', label: 'Living Objects', cell: { width: 132, height: 180 }, images: livingObjectsDigits },
  { kind: 'sprite', id: 'pocket-monsters', label: 'Pocket Monsters', cell: { width: 137, height: 180 }, images: pocketMonstersDigits },
];

/** Every value the `theme` parameter accepts besides `flat`, in the order the builder shows them. */
export const DIGIT_THEMES: readonly DigitTheme[] = [...GLYPH_THEMES, ...SPRITE_THEMES];

const themesById = new Map<string, DigitTheme>(DIGIT_THEMES.map((theme) => [theme.id, theme]));

export function findTheme(id: string | undefined): DigitTheme | undefined {
  return id ? themesById.get(id) : undefined;
}
