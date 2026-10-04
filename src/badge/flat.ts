import { escapeXml, graphemes } from '../lib/text.js';
import type { Animation, FlatStyle } from './options.js';
import { svgDocument } from './svg.js';

const HEIGHT = 28;
const MIN_WIDTH = 80;
const CHAR_WIDTH = 9;
const ICON_WIDTH = 20;
const PADDING = 24;

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Entrance animations; each one animates the `.badge` group once. */
const ANIMATION_CSS: Record<Animation, string> = {
  none: '',
  fade: '@keyframes enter{from{opacity:0}to{opacity:1}}.badge{animation:enter 1.5s ease-out both}',
  slide:
    '@keyframes enter{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}' +
    '.badge{animation:enter .8s cubic-bezier(.2,.8,.2,1) both}',
  pulse:
    '@keyframes enter{0%{transform:scale(.9)}50%{transform:scale(1.05)}100%{transform:scale(1)}}' +
    '.badge{animation:enter .6s ease-in-out both;transform-origin:center}',
};

/** A rounded pill with the count in compact form (1.3K, 2.4M) and an optional icon. */
export function renderFlatBadge(count: number, style: FlatStyle, scale: number): string {
  const label = compactNumber.format(count);
  const iconCount = graphemes(style.icon).length;
  const text = iconCount ? `${escapeXml(style.icon)} ${label}` : label;
  const width = Math.max(MIN_WIDTH, label.length * CHAR_WIDTH + iconCount * ICON_WIDTH + PADDING);

  const body =
    `<style>.label{font:600 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}` +
    `${ANIMATION_CSS[style.animation]}</style>` +
    `<g class="badge">` +
    `<rect x=".5" y=".5" width="${width - 1}" height="${HEIGHT - 1}" rx="6" ` +
    `fill="${style.background}" stroke="${style.border}"/>` +
    `<text class="label" x="50%" y="50%" dominant-baseline="central" text-anchor="middle" ` +
    `fill="${style.foreground}">${text}</text>` +
    `</g>`;

  return svgDocument(width, HEIGHT, scale, body);
}
