import { graphemes, safeColor } from '../lib/text.js';
import { findTheme, type GlyphTheme } from '../themes/catalog.js';

export const MAX_HANDLE_LENGTH = 39;
export const DIGITS = { min: 1, max: 16, fallback: 7 } as const;
export const SCALE = { min: 0.1, max: 10, fallback: 1 } as const;
export const MAX_ICON_GRAPHEMES = 2;

export const ANIMATIONS = ['none', 'fade', 'slide', 'pulse'] as const;
export type Animation = (typeof ANIMATIONS)[number];

export const FLAT_COLORS = {
  background: '#21262d',
  foreground: '#c9d1d9',
  border: '#30363d',
} as const;

export interface FlatStyle {
  kind: 'flat';
  background: string;
  foreground: string;
  border: string;
  /** Up to MAX_ICON_GRAPHEMES characters, not yet escaped. */
  icon: string;
  animation: Animation;
}

export interface GlyphStyle {
  kind: 'glyph';
  theme: GlyphTheme;
  /** Minimum number of digits; the count is left-padded with zeros. */
  digits: number;
  foreground: string;
  background: string;
}

export interface BadgeRequest {
  /** Normalized handle: lowercase, `[a-z0-9_-]`, at most MAX_HANDLE_LENGTH long. */
  handle: string;
  /** `render=true`: show the count without adding a visit. */
  readOnly: boolean;
  /** `num=`: show this number instead of the real count. */
  fixedCount: number | null;
  scale: number;
  style: BadgeStyle;
}

export type BadgeStyle = FlatStyle | GlyphStyle;

export type ParseResult = { ok: true; value: BadgeRequest } | { ok: false; error: string };

type Query = (name: string) => string | undefined;

/**
 * Validates everything a badge request can carry. Out-of-range numbers are
 * clamped or reset to their defaults; only inputs that can't be interpreted at
 * all (an empty or too-long handle, a non-numeric `num`) are rejected.
 */
export function parseBadgeRequest(rawHandle: string, query: Query): ParseResult {
  const handle = normalizeHandle(rawHandle);
  if (!handle) {
    return { ok: false, error: 'Invalid handle' };
  }

  let fixedCount: number | null = null;
  const num = query('num');
  if (num) {
    fixedCount = toCount(num);
    if (fixedCount === null) {
      return { ok: false, error: 'Invalid num' };
    }
  }

  return {
    ok: true,
    value: {
      handle,
      readOnly: query('render') === 'true',
      fixedCount,
      scale: toScale(query('scale')),
      style: parseStyle(query),
    },
  };
}

function parseStyle(query: Query): BadgeStyle {
  const theme = findTheme(query('theme'));

  if (theme) {
    return {
      kind: 'glyph',
      theme,
      digits: toDigits(query('length')),
      foreground: safeColor(query('color'), theme.colors.foreground),
      background: safeColor(query('bg'), theme.colors.background),
    };
  }

  return {
    kind: 'flat',
    background: safeColor(query('bg'), FLAT_COLORS.background),
    foreground: safeColor(query('color'), FLAT_COLORS.foreground),
    border: safeColor(query('stroke'), FLAT_COLORS.border),
    icon: graphemes(query('icon') ?? '').slice(0, MAX_ICON_GRAPHEMES).join(''),
    animation: toAnimation(query('animation')),
  };
}

/** Drops unsupported characters and lowercases, so `@Umt` and `@umt` share a counter. */
export function normalizeHandle(raw: string): string | null {
  const handle = raw.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  return handle && handle.length <= MAX_HANDLE_LENGTH ? handle : null;
}

/**
 * Turns `num` into a whole number that prints as plain digits: negatives become 0,
 * decimals round down and huge values stop at 2^53-1 (so `1e21` can't turn into
 * the string "1e+21"). Returns null when the value isn't a number at all.
 */
export function toCount(value: string): number | null {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.floor(Math.min(Math.max(n, 0), Number.MAX_SAFE_INTEGER));
}

function toDigits(value: string | undefined): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(n) || n < DIGITS.min) return DIGITS.fallback;
  return Math.min(n, DIGITS.max);
}

function toScale(value: string | undefined): number {
  const n = value ? parseFloat(value) : NaN;
  return n >= SCALE.min && n <= SCALE.max ? n : SCALE.fallback;
}

function toAnimation(value: string | undefined): Animation {
  return ANIMATIONS.find((name) => name === value) ?? 'none';
}
