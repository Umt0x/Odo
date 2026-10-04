import { describe, expect, it } from 'vitest';
import { normalizeHandle, parseBadgeRequest, toCount, type BadgeRequest } from '../src/badge/options.js';
import { escapeXml, safeColor } from '../src/lib/text.js';

function parse(handle: string, query: Record<string, string> = {}): BadgeRequest {
  const result = parseBadgeRequest(handle, (name) => query[name]);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe('handles', () => {
  it('lowercases and drops unsupported characters', () => {
    expect(normalizeHandle('Umt')).toBe('umt');
    expect(normalizeHandle('u.m-t_1!')).toBe('um-t_1');
  });

  it('rejects empty and over-long handles', () => {
    expect(normalizeHandle('...')).toBeNull();
    expect(normalizeHandle('a'.repeat(39))).toBe('a'.repeat(39));
    expect(normalizeHandle('a'.repeat(40))).toBeNull();
  });
});

describe('fixed counts (num)', () => {
  it('produces whole, non-negative, plain-digit numbers', () => {
    expect(toCount('1337')).toBe(1337);
    expect(toCount('-5')).toBe(0);
    expect(toCount('7.9')).toBe(7);
    expect(toCount('1e21')).toBe(Number.MAX_SAFE_INTEGER);
    expect(String(toCount('1e21'))).toMatch(/^\d+$/);
  });

  it('rejects values that are not numbers', () => {
    expect(toCount('abc')).toBeNull();
    expect(parseBadgeRequest('umt', (name) => (name === 'num' ? 'abc' : undefined))).toEqual({
      ok: false,
      error: 'Invalid num',
    });
  });
});

describe('style selection', () => {
  it('uses the flat style unless a known sprite theme is requested', () => {
    expect(parse('umt').style.kind).toBe('flat');
    expect(parse('umt', { theme: 'nope' }).style.kind).toBe('flat');
    expect(parse('umt', { theme: 'gumball' }).style.kind).toBe('sprite');
  });

  it('gives drawn themes their own default colors, overridable by color and bg', () => {
    const led = parse('umt', { theme: 'led' }).style;
    expect(led.kind).toBe('glyph');
    expect(led.kind === 'glyph' && led.foreground).toBe('#ff453a');

    const custom = parse('umt', { theme: 'led', color: '00ff00', bg: 'transparent' }).style;
    expect(custom.kind === 'glyph' && [custom.foreground, custom.background]).toEqual(['#00ff00', 'transparent']);
  });

  it('does not treat object property names as themes', () => {
    expect(parse('umt', { theme: 'constructor' }).style.kind).toBe('flat');
  });

  it('clamps digits and scale into their ranges', () => {
    const digits = (length: string) => {
      const { style } = parse('umt', { theme: 'gumball', length });
      return style.kind === 'sprite' ? style.digits : NaN;
    };
    expect(digits('3')).toBe(3);
    expect(digits('0')).toBe(7);
    expect(digits('99')).toBe(16);

    expect(parse('umt', { scale: '1.5' }).scale).toBe(1.5);
    expect(parse('umt', { scale: '50' }).scale).toBe(1);
  });

  it('keeps at most two characters of the icon, counting emoji as one', () => {
    const icon = (value: string) => {
      const { style } = parse('umt', { icon: value });
      return style.kind === 'flat' ? style.icon : '';
    };
    expect(icon('🔥🚀✨')).toBe('🔥🚀');
    expect(icon('👨‍👩‍👧‍👦x')).toBe('👨‍👩‍👧‍👦x');
  });
});

describe('text helpers', () => {
  it('escapes markup characters', () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('accepts hex colors and color names, rejects anything else', () => {
    expect(safeColor('fff', '#000')).toBe('#fff');
    expect(safeColor('#ff0000', '#000')).toBe('#ff0000');
    expect(safeColor('DarkGray', '#000')).toBe('DarkGray');
    expect(safeColor('red" onload="alert(1)', '#000')).toBe('#000');
    expect(safeColor('rgb(1,2,3)', '#000')).toBe('#000');
  });
});
