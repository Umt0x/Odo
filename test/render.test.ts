import { describe, expect, it } from 'vitest';
import { renderFlatBadge } from '../src/badge/flat.js';
import { renderGlyphBadge } from '../src/badge/glyph.js';
import { FLAT_COLORS, type FlatStyle, type GlyphStyle } from '../src/badge/options.js';
import { GLYPH_THEMES, findTheme } from '../src/themes/catalog.js';
import { badgeText } from './helpers.js';

const flat: FlatStyle = { kind: 'flat', ...FLAT_COLORS, icon: '', animation: 'none' };

describe('flat badge', () => {
  it('shows the count in compact form', () => {
    expect(badgeText(renderFlatBadge(42, flat, 1))).toBe('42');
    expect(badgeText(renderFlatBadge(1337, flat, 1))).toBe('1.3K');
  });

  it('scales the displayed size but not the drawing', () => {
    const svg = renderFlatBadge(1, flat, 2);
    expect(svg).toContain('width="160" height="56" viewBox="0 0 80 28"');
    expect(renderFlatBadge(1, flat, 1.1)).toContain('width="88"');
  });

  it('escapes the icon', () => {
    const svg = renderFlatBadge(1, { ...flat, icon: '<s' }, 1);
    expect(svg).toContain('&lt;s 1');
    expect(svg).not.toContain('<s ');
  });
});

describe('glyph badges', () => {
  const glyph = (id: string, digits = 4): GlyphStyle => {
    const theme = findTheme(id)!;
    return { kind: 'glyph', theme, digits, ...theme.colors };
  };

  it.each(GLYPH_THEMES.map((t) => t.id))('%s draws one cell per digit and widens with the count', (id) => {
    const width = (svg: string) => Number(svg.match(/viewBox="0 0 ([\d.]+) /)![1]);
    const four = renderGlyphBadge(2026, glyph(id), 1);
    const seven = renderGlyphBadge(1234567, glyph(id), 1);

    expect(four).toMatch(/^<svg [^>]*viewBox="0 0 [\d.]+ [\d.]+">/);
    expect(width(seven)).toBeGreaterThan(width(four));
  });

  it('uses the requested colors', () => {
    const svg = renderGlyphBadge(8, { ...glyph('pixel', 1), foreground: '#123456', background: '#abcdef' }, 1);
    expect(svg).toContain('fill="#123456"');
    expect(svg).toContain('fill="#abcdef"');
  });

  it('lights the right LED segments', () => {
    const lit = (digit: number) =>
      (renderGlyphBadge(digit, glyph('led', 1), 1).match(/<rect [^>]*rx="1"\/>/g) ?? []).length;
    expect(lit(1)).toBe(2);
    expect(lit(8)).toBe(7);
  });

  it('shows the digits as text on odometer and flip', () => {
    for (const id of ['odometer', 'flip']) {
      const svg = renderGlyphBadge(2026, glyph(id), 1);
      expect(svg.match(/<text [^>]*>(\d)<\/text>/g)?.map((t) => t.replace(/<[^>]+>/g, '')).join('')).toBe('2026');
    }
  });
});
