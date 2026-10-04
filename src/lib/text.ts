const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for use inside SVG/HTML markup or a quoted attribute. */
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ENTITIES[ch]);
}

const HEX_COLOR = /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAMED_COLOR = /^[a-z]+$/i;

/**
 * Accepts a hex color (with or without `#`) or a plain CSS color name and
 * returns it in a form that is safe to place in an SVG attribute.
 * Anything else — `rgb(...)`, quotes, spaces — falls back.
 */
export function safeColor(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const value = input.trim().replace(/^#/, '');
  if (HEX_COLOR.test(value)) return `#${value}`;
  if (NAMED_COLOR.test(value)) return value;
  return fallback;
}

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/** Splits text into user-perceived characters, so a multi-codepoint emoji counts as one. */
export function graphemes(value: string): string[] {
  return Array.from(graphemeSegmenter.segment(value), (part) => part.segment);
}
