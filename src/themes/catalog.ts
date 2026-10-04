export type ThemeId = 'pixel' | 'led' | 'odometer' | 'flip';

/** A digit theme drawn in code (see badge/glyph.ts); recolorable with `color` and `bg`. */
export interface GlyphTheme {
  id: ThemeId;
  label: string;
  colors: { foreground: string; background: string };
}

/**
 * Every value the `theme` parameter accepts besides `flat`, in the order the
 * builder shows them. To add one, give it a drawing function in badge/glyph.ts.
 */
export const GLYPH_THEMES: readonly GlyphTheme[] = [
  { id: 'pixel', label: 'Pixel', colors: { foreground: '#39d353', background: '#0d1117' } },
  { id: 'led', label: 'LED', colors: { foreground: '#ff453a', background: '#111111' } },
  { id: 'odometer', label: 'Odometer', colors: { foreground: '#f5f5f5', background: '#1f2328' } },
  { id: 'flip', label: 'Flip', colors: { foreground: '#f1f3f4', background: '#202124' } },
];

const themesById = new Map<string, GlyphTheme>(GLYPH_THEMES.map((theme) => [theme.id, theme]));

export function findTheme(id: string | undefined): GlyphTheme | undefined {
  return id ? themesById.get(id) : undefined;
}
