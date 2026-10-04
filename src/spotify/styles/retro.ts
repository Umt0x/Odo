import { svgDocument } from '../../badge/svg.js';
import { pixelPath, toPixelText } from '../../lib/pixel-font.js';
import { escapeXml } from '../../lib/text.js';
import {
  clip,
  clock,
  frame,
  hasTrack,
  isPlaying,
  MESSAGES,
  messageCard,
  progressOf,
  stylesheet,
  type Renderer,
} from '../card-kit.js';

const SPIN = `.reel{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

/* --------------------------------------------------------------- cassette */

function reel(cx: number, cy: number, tape: number, spinning: boolean, o: { foreground: string }): string {
  const teeth = [0, 60, 120, 180, 240, 300]
    .map((angle) => `<rect x="${cx - 1.5}" y="${cy - 8}" width="3" height="4" rx="1" transform="rotate(${angle} ${cx} ${cy})" fill="#000" fill-opacity=".45"/>`)
    .join('');
  return (
    `<circle cx="${cx}" cy="${cy}" r="${tape.toFixed(1)}" fill="#4a3426" fill-opacity=".92"/>` +
    `<g class="${spinning ? 'reel' : ''}"><circle cx="${cx}" cy="${cy}" r="8" fill="${o.foreground}" fill-opacity=".9"/>${teeth}</g>`
  );
}

/** A tape with two reels that turn while the song plays; tape winds from left to right as it progresses. */
export const renderCassette: Renderer = (now, o) => {
  const width = 400;
  const height = 150;
  if (!hasTrack(now)) return svgDocument(width, height, o.scale, messageCard(now, o, width, height, 12));

  const progress = progressOf(now);
  const spinning = isPlaying(now);
  const textX = o.showCover ? 78 : 38;
  const screws = [
    [18, 18],
    [382, 18],
    [18, 132],
    [382, 132],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${o.foreground}" fill-opacity=".22"/>`)
    .join('');

  const body =
    stylesheet(o, SPIN) +
    `<defs><clipPath id="cover"><rect x="32" y="24" width="38" height="38" rx="4"/></clipPath></defs>` +
    frame(width, height, 12, o) +
    screws +
    // Label: inverted colors so the text reads like ink on a sticker.
    `<rect x="26" y="18" width="348" height="50" rx="6" fill="${o.foreground}" fill-opacity=".94"/>` +
    `<rect x="26" y="60" width="348" height="3" fill="${o.accent}"/>` +
    (o.showCover && now.cover
      ? `<image x="32" y="24" width="38" height="38" href="${now.cover}" clip-path="url(#cover)" preserveAspectRatio="xMidYMid slice"/>`
      : '') +
    `<text class="t" x="${textX}" y="40" font-size="14" font-weight="700" fill="${o.background}">${clip(now.title, o.showCover ? 34 : 40)}</text>` +
    `<text class="t" x="${textX}" y="55" font-size="11" fill="${o.background}" fill-opacity=".7">${clip(now.artist, 44)}</text>` +
    // Window with the reels.
    `<rect x="100" y="76" width="200" height="44" rx="22" fill="#000" fill-opacity=".5" stroke="${o.foreground}" stroke-opacity=".15"/>` +
    reel(148, 98, 9 + 11 * (1 - progress), spinning, o) +
    reel(252, 98, 9 + 11 * progress, spinning, o) +
    `<path d="M112 146 L128 128 H272 L288 146" fill="${o.foreground}" fill-opacity=".07"/>` +
    `<text class="m muted" x="26" y="140" font-size="10">${spinning ? 'PLAY' : now.state === 'paused' ? 'PAUSE' : 'LAST'}</text>` +
    `<text class="m muted" x="374" y="140" font-size="10" text-anchor="end">${clock(now.progressMs)} / ${clock(now.durationMs)}</text>`;

  return svgDocument(width, height, o.scale, body);
};

/* --------------------------------------------------------------- terminal */

/** A shell window printing the current song; the cursor blinks on the last line. */
export const renderTerminal: Renderer = (now, o) => {
  const width = 440;
  const lines = o.showProgress && hasTrack(now) ? 6 : 5;
  const height = 30 + lines * 21 + 12;
  const x = 18;
  const y = (row: number) => 30 + 21 * (row + 1);

  const status = hasTrack(now)
    ? { playing: 'now playing', paused: 'paused', recent: 'last played' }[now.state]
    : MESSAGES[now.state].toLowerCase();

  let rows =
    `<text class="m" x="${x}" y="${y(0)}" font-size="13"><tspan class="accent">$</tspan> <tspan class="fg">odo spotify</tspan></text>` +
    `<text class="m" x="${x}" y="${y(1)}" font-size="13"><tspan class="accent">●</tspan> <tspan class="muted">${escapeXml(status)}</tspan></text>`;

  let row = 2;
  if (hasTrack(now)) {
    rows +=
      `<text class="m fg" x="${x}" y="${y(row++)}" font-size="13" font-weight="700">${clip(now.title, 46)}</text>` +
      `<text class="m muted" x="${x}" y="${y(row++)}" font-size="13">${clip(now.artist, 50)}</text>`;
    if (o.showProgress) {
      const cells = 24;
      const filled = Math.round(progressOf(now) * cells);
      const bar = Array.from({ length: cells }, (_, i) =>
        `<rect x="${x + 10 + i * 8}" y="${y(row) - 10}" width="6" height="11" rx="1" class="${i < filled ? 'accent' : 'line'}"/>`
      ).join('');
      rows +=
        `<text class="m muted" x="${x}" y="${y(row)}" font-size="13">[</text>` +
        bar +
        `<text class="m muted" x="${x + 10 + cells * 8 + 2}" y="${y(row)}" font-size="13">] ${clock(now.progressMs)} / ${clock(now.durationMs)}</text>`;
      row++;
    }
  }
  rows +=
    `<text class="m accent" x="${x}" y="${y(row)}" font-size="13">$</text>` +
    `<rect class="cursor fg" x="${x + 14}" y="${y(row) - 11}" width="8" height="14"/>`;

  const body =
    stylesheet(o, `.cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`) +
    `<defs><clipPath id="win"><rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="10"/></clipPath></defs>` +
    frame(width, height, 10, o) +
    `<rect clip-path="url(#win)" x="0" y="0" width="${width}" height="28" fill="${o.foreground}" fill-opacity=".06"/>` +
    `<circle cx="18" cy="14" r="5" fill="#ff5f57"/><circle cx="34" cy="14" r="5" fill="#febc2e"/><circle cx="50" cy="14" r="5" fill="#28c840"/>` +
    `<text class="m muted" x="${width / 2}" y="18" font-size="11" text-anchor="middle">now-playing — zsh</text>` +
    rows;

  return svgDocument(width, height, o.scale, body);
};

/* -------------------------------------------------------------------- lcd */

const LCD_SCREEN = '#a7b98a';
const LCD_INK = '#1f2a16';

/** A green pixel LCD; long titles scroll across the screen like a car stereo. */
export const renderLcd: Renderer = (now, o) => {
  const width = 400;
  const height = 122;
  const screen = { x: 16, y: 16, w: 368, h: 74 };
  const pad = 10;

  const title = toPixelText(hasTrack(now) ? now.title : MESSAGES[now.state]);
  const artist = hasTrack(now) ? toPixelText(now.artist) : '';
  const titleSize = 3;
  const visible = Math.floor((screen.w - pad * 2) / (6 * titleSize));
  const titleWidth = title.length * 6 * titleSize;

  // Too long to fit: run two copies side by side and slide them left forever.
  let line1: string;
  let marquee = '';
  if (title.length > visible) {
    const gap = 6 * titleSize * 4;
    const distance = titleWidth + gap;
    line1 =
      `<g class="marquee"><path d="${pixelPath(title, screen.x + pad, screen.y + 10, titleSize)}"/>` +
      `<path d="${pixelPath(title, screen.x + pad + distance, screen.y + 10, titleSize)}"/></g>`;
    marquee = `.marquee{animation:scroll ${(distance / 40).toFixed(1)}s linear infinite}@keyframes scroll{to{transform:translateX(-${distance}px)}}`;
  } else {
    line1 = `<path d="${pixelPath(title, screen.x + pad, screen.y + 10, titleSize)}"/>`;
  }

  const artistSize = 2;
  const artistVisible = Math.floor((screen.w - pad * 2) / (6 * artistSize));
  const line2 = artist
    ? `<path d="${pixelPath(artist.slice(0, artistVisible), screen.x + pad, screen.y + 10 + 7 * titleSize + 10, artistSize)}"/>`
    : '';

  const playing = isPlaying(now);
  const info = hasTrack(now)
    ? `${playing ? 'PLAY' : now.state === 'paused' ? 'PAUSE' : 'LAST'}  ${o.showProgress ? `${clock(now.progressMs)} / ${clock(now.durationMs)}` : ''}`
    : '';

  const body =
    stylesheet(o, marquee + `.led{animation:led 1.4s ease-in-out infinite alternate}@keyframes led{to{opacity:.25}}`) +
    `<defs><clipPath id="screen"><rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="6"/></clipPath></defs>` +
    frame(width, height, 14, o) +
    `<rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="6" fill="${LCD_SCREEN}" stroke="#000" stroke-opacity=".25"/>` +
    `<g clip-path="url(#screen)" fill="${LCD_INK}">${line1}${line2}</g>` +
    `<text class="m muted" x="${screen.x}" y="${height - 12}" font-size="11" letter-spacing="1">${info}</text>` +
    `<circle class="${playing ? 'led accent' : 'line'}" cx="${width - 24}" cy="${height - 16}" r="4"/>` +
    `<text class="t muted" x="${width - 34}" y="${height - 12}" font-size="10" text-anchor="end">SPOTIFY</text>`;

  return svgDocument(width, height, o.scale, body);
};
