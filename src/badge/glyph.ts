import type { ThemeId } from '../themes/catalog.js';
import type { GlyphStyle } from './options.js';
import { svgDocument } from './svg.js';

interface Colors {
  foreground: string;
  background: string;
}

interface Drawing {
  width: number;
  height: number;
  body: string;
}

const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

/** 5×7 bitmap font; each string is one row, `1` marks a lit pixel. */
const PIXEL_FONT: Record<string, readonly string[]> = {
  0: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

/** Lit segments per digit; a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle. */
const SEGMENTS: Record<string, string> = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
};

/** Classic dot-matrix digits on a dark panel. */
function drawPixel(digits: string[], { foreground, background }: Colors): Drawing {
  const pitch = 3;
  const dot = 2.5;
  const pad = 4;
  const glyphWidth = 5 * pitch - (pitch - dot);
  const gap = 4;

  let path = '';
  digits.forEach((digit, i) => {
    const left = pad + i * (glyphWidth + gap);
    PIXEL_FONT[digit].forEach((row, y) => {
      [...row].forEach((bit, x) => {
        if (bit === '1') path += `M${left + x * pitch} ${pad + y * pitch}h${dot}v${dot}h-${dot}z`;
      });
    });
  });

  const width = pad * 2 + digits.length * glyphWidth + (digits.length - 1) * gap;
  const height = pad * 2 + 7 * pitch - (pitch - dot);
  return {
    width,
    height,
    body: `<rect width="${width}" height="${height}" rx="5" fill="${background}"/><path d="${path}" fill="${foreground}"/>`,
  };
}

/** Slanted seven-segment digits; unlit segments stay faintly visible like a real display. */
function drawLed(digits: string[], { foreground, background }: Colors): Drawing {
  const w = 12;
  const h = 20;
  const t = 2.4;
  const gap = 5;
  const padX = 7;
  const padY = 4;
  const slant = 3;
  const half = h / 2;
  const long = half - t * 1.5;

  const shapes: Record<string, [number, number, number, number]> = {
    a: [t, 0, w - 2 * t, t],
    b: [w - t, t, t, long],
    c: [w - t, half + t / 2, t, long],
    d: [t, h - t, w - 2 * t, t],
    e: [0, half + t / 2, t, long],
    f: [0, t, t, long],
    g: [t, half - t / 2, w - 2 * t, t],
  };

  const body = digits
    .map((digit, i) => {
      const lit = SEGMENTS[digit];
      const segments = Object.entries(shapes)
        .map(([name, [x, y, sw, sh]]) => {
          const opacity = lit.includes(name) ? '' : ' fill-opacity=".12"';
          return `<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="1"${opacity}/>`;
        })
        .join('');
      return `<g transform="translate(${padX + slant + i * (w + gap)} ${padY}) skewX(-8)">${segments}</g>`;
    })
    .join('');

  const width = padX * 2 + slant + digits.length * w + (digits.length - 1) * gap;
  const height = padY * 2 + h;
  return {
    width,
    height,
    body: `<rect width="${width}" height="${height}" rx="5" fill="${background}"/><g fill="${foreground}">${body}</g>`,
  };
}

/** Rolling number wheels in a frame; the last wheel is red, like a car's tenths drum. */
function drawOdometer(digits: string[], { foreground, background }: Colors): Drawing {
  const cell = 18;
  const h = 24;
  const gap = 2;
  const pad = 2;
  const width = pad * 2 + digits.length * cell + (digits.length - 1) * gap;
  const height = pad * 2 + h;

  const wheels = digits
    .map((digit, i) => {
      const x = pad + i * (cell + gap);
      const last = i === digits.length - 1;
      return (
        `<rect x="${x}" y="${pad}" width="${cell}" height="${h}" rx="2" fill="${last ? '#d1242f' : background}"/>` +
        // Darker bands top and bottom suggest the curve of the drum.
        `<rect x="${x}" y="${pad}" width="${cell}" height="5" rx="2" fill="#000" fill-opacity=".28"/>` +
        `<rect x="${x}" y="${pad + h - 5}" width="${cell}" height="5" rx="2" fill="#000" fill-opacity=".28"/>` +
        `<text x="${x + cell / 2}" y="${pad + h / 2 + 1}" fill="${last ? '#ffffff' : foreground}">${digit}</text>`
      );
    })
    .join('');

  return {
    width,
    height,
    body:
      `<rect width="${width}" height="${height}" rx="4" fill="${background}"/>` +
      `<rect width="${width}" height="${height}" rx="4" fill="#000" fill-opacity=".45"/>` +
      `<g font-family="${MONO}" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="central">${wheels}</g>`,
  };
}

/** Split-flap cards with a hinge line across the middle. */
function drawFlip(digits: string[], { foreground, background }: Colors): Drawing {
  const card = 20;
  const h = 28;
  const gap = 3;
  const width = digits.length * card + (digits.length - 1) * gap;

  const cards = digits
    .map((digit, i) => {
      const x = i * (card + gap);
      return (
        `<rect x="${x}" width="${card}" height="${h}" rx="3" fill="${background}"/>` +
        `<rect x="${x}" width="${card}" height="${h / 2}" rx="3" fill="#fff" fill-opacity=".06"/>` +
        `<text x="${x + card / 2}" y="${h / 2 + 1}">${digit}</text>` +
        `<rect x="${x}" y="${h / 2 - 0.6}" width="${card}" height="1.2" fill="#000" fill-opacity=".5"/>`
      );
    })
    .join('');

  return {
    width,
    height: h,
    body: `<g font-family="${MONO}" font-size="18" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${foreground}">${cards}</g>`,
  };
}

const DRAWERS: Record<ThemeId, (digits: string[], colors: Colors) => Drawing> = {
  pixel: drawPixel,
  led: drawLed,
  odometer: drawOdometer,
  flip: drawFlip,
};

/** Draws the count with one of the code-drawn themes; no images involved. */
export function renderGlyphBadge(count: number, style: GlyphStyle, scale: number): string {
  const digits = String(count).padStart(style.digits, '0').split('');
  const { width, height, body } = DRAWERS[style.theme.id](digits, style);
  return svgDocument(round(width), round(height), scale, body);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
