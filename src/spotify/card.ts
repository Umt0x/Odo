import { svgDocument } from '../badge/svg.js';
import { escapeXml, graphemes, safeColor } from '../lib/text.js';
import type { NowPlaying } from './spotify-account.js';

export const CARD_STYLES = ['card', 'compact', 'vinyl'] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

export const SPOTIFY_GREEN = '#1db954';

/** `mode=dark|light` picks one of these; `bg` and `color` override it. */
export const CARD_PRESETS = {
  dark: { background: '#111113', foreground: '#fafafa' },
  light: { background: '#ffffff', foreground: '#0a0a0a' },
} as const;

export interface CardOptions {
  style: CardStyle;
  background: string;
  foreground: string;
  accent: string;
  showCover: boolean;
  showProgress: boolean;
  scale: number;
}

type Query = (name: string) => string | undefined;

export function parseCardOptions(query: Query): CardOptions {
  const preset = CARD_PRESETS[query('mode') === 'light' ? 'light' : 'dark'];
  const scale = parseFloat(query('scale') ?? '');
  return {
    style: CARD_STYLES.find((style) => style === query('style')) ?? 'card',
    background: safeColor(query('bg'), preset.background),
    foreground: safeColor(query('color'), preset.foreground),
    accent: safeColor(query('accent'), SPOTIFY_GREEN),
    showCover: query('cover') !== '0',
    showProgress: query('progress') !== '0',
    scale: scale >= 0.1 && scale <= 10 ? scale : 1,
  };
}

type Track = Extract<NowPlaying, { title: string }>;

const FONT = '-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif';

const STATUS: Record<Track['state'], string> = {
  playing: 'Now playing',
  paused: 'Paused',
  recent: 'Last played',
};

const MESSAGES: Record<Exclude<NowPlaying['state'], Track['state']>, string> = {
  disconnected: 'Spotify is not connected yet',
  idle: 'Nothing played on Spotify yet',
  unavailable: 'Spotify is not reachable right now',
};

/** SVG text can't ellipsize itself, so long titles are cut by character count. */
function clip(text: string, max: number): string {
  const chars = graphemes(text);
  return escapeXml(chars.length > max ? `${chars.slice(0, max - 1).join('').trimEnd()}…` : text);
}

/**
 * Shared CSS. Muted text, borders and tracks are the foreground color at lower
 * opacity, so any background/foreground pair stays readable.
 */
function stylesheet(o: CardOptions, extra = ''): string {
  return (
    `<style>` +
    `.t{font-family:${FONT}}.fg{fill:${o.foreground}}.muted{fill:${o.foreground};fill-opacity:.6}` +
    `.line{fill:${o.foreground};fill-opacity:.13}.accent{fill:${o.accent}}` +
    `.eq{transform-box:fill-box;transform-origin:bottom}` +
    `@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}}` +
    extra +
    `</style>`
  );
}

function frame(width: number, height: number, radius: number, o: CardOptions): string {
  return (
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="${o.background}"/>` +
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${o.foreground}" stroke-opacity=".12"/>`
  );
}

/** Three bouncing bars while music plays; still otherwise. */
function equalizer(x: number, y: number, animated: boolean): string {
  return [0, 1, 2]
    .map((i) => {
      const style = animated ? ` style="animation:eq ${0.9 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate"` : '';
      return `<rect class="eq accent" x="${x + i * 4}" y="${y}" width="2.5" height="10" rx="1"${style}/>`;
    })
    .join('');
}

/** A track with a fill that keeps moving to the end of the song while it plays. */
function progressBar(x: number, y: number, width: number, now: Track): string {
  const progress = now.durationMs > 0 ? Math.min(now.progressMs / now.durationMs, 1) : 0;
  const playing = now.state === 'playing';
  return (
    `<rect class="line" x="${x}" y="${y}" width="${width}" height="3" rx="1.5"/>` +
    `<rect class="${playing ? 'accent progress' : 'muted'}" x="${x}" y="${y}" width="${(width * progress).toFixed(1)}" height="3" rx="1.5"/>`
  );
}

function progressCss(now: Track, width: number): string {
  if (now.state !== 'playing') return '';
  const remaining = Math.max((now.durationMs - now.progressMs) / 1000, 0);
  return `@keyframes progress{to{width:${width}px}}.progress{animation:progress ${remaining.toFixed(0)}s linear forwards}`;
}

function coverImage(now: Track, x: number, y: number, size: number, clipId: string, o: CardOptions): string {
  return now.cover
    ? `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${now.cover}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect class="line" x="${x}" y="${y}" width="${size}" height="${size}" rx="${size / 9}"/>`;
}

/* ------------------------------------------------------------------ card */

function renderCard(now: NowPlaying, o: CardOptions): string {
  const width = 400;
  const height = 104;
  const pad = 14;
  const cover = 76;

  if (!('title' in now)) {
    return svgDocument(
      width,
      height,
      o.scale,
      stylesheet(o) +
        frame(width, height, 14, o) +
        equalizer(pad + 6, height / 2 - 5, false) +
        `<text class="t muted" x="${pad + 26}" y="${height / 2}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`
    );
  }

  const textX = o.showCover ? pad + cover + 16 : pad + 6;
  const barWidth = width - textX - pad - 6;
  const textY = o.showProgress ? 0 : 6;

  const body =
    stylesheet(o, progressCss(now, barWidth)) +
    `<defs><clipPath id="cover"><rect x="${pad}" y="${pad}" width="${cover}" height="${cover}" rx="8"/></clipPath></defs>` +
    frame(width, height, 14, o) +
    (o.showCover ? coverImage(now, pad, pad, cover, 'cover', o) : '') +
    equalizer(textX, pad + 2 + textY, now.state === 'playing') +
    `<g class="t">` +
    `<text class="muted" x="${textX + 16}" y="${pad + 11 + textY}" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
    `<text class="fg" x="${textX}" y="${pad + 36 + textY}" font-size="15" font-weight="600">${clip(now.title, o.showCover ? 34 : 42)}</text>` +
    `<text class="muted" x="${textX}" y="${pad + 55 + textY}" font-size="13">${clip(now.artist, o.showCover ? 40 : 50)}</text>` +
    `</g>` +
    (o.showProgress ? progressBar(textX, height - pad - 6, barWidth, now) : '');

  return svgDocument(width, height, o.scale, body);
}

/* --------------------------------------------------------------- compact */

function renderCompact(now: NowPlaying, o: CardOptions): string {
  const height = 40;
  const hasTrack = 'title' in now;
  const withCover = hasTrack && o.showCover;
  const left = withCover ? 40 : 16;
  const text = hasTrack ? `${now.title} · ${now.artist}` : MESSAGES[now.state];
  const label = clip(text, 48);
  const width = Math.min(Math.max(left + 16 + graphemes(text).slice(0, 48).length * 7 + 18, 220), 460);

  const body =
    stylesheet(o) +
    `<defs><clipPath id="cover"><circle cx="22" cy="20" r="13"/></clipPath></defs>` +
    frame(width, height, 20, o) +
    (withCover ? coverImage(now, 9, 7, 26, 'cover', o) : '') +
    equalizer(left, 15, hasTrack && now.state === 'playing') +
    `<text class="t ${hasTrack ? 'fg' : 'muted'}" x="${left + 18}" y="${height / 2}" dominant-baseline="central" font-size="13" font-weight="${hasTrack ? 500 : 400}">${label}</text>`;

  return svgDocument(width, height, o.scale, body);
}

/* ----------------------------------------------------------------- vinyl */

function renderVinyl(now: NowPlaying, o: CardOptions): string {
  const width = 400;
  const height = 124;
  const cx = 62;
  const cy = height / 2;
  const hasTrack = 'title' in now;
  const spinning = hasTrack && now.state === 'playing';
  const textX = 128;
  const barWidth = width - textX - 22;

  const grooves = [44, 38, 32, 26].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".07"/>`).join('');
  const label =
    hasTrack && o.showCover && now.cover
      ? `<image x="${cx - 19}" y="${cy - 19}" width="38" height="38" href="${now.cover}" clip-path="url(#label)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle class="accent" cx="${cx}" cy="${cy}" r="19"/>`;

  const disc =
    `<g class="${spinning ? 'disc' : ''}">` +
    `<circle cx="${cx}" cy="${cy}" r="50" fill="#0b0b0c"/>` +
    grooves +
    // A soft highlight across the grooves sells the spin.
    `<path d="M${cx - 34} ${cy - 36} A50 50 0 0 1 ${cx + 30} ${cy - 40}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="6" stroke-linecap="round"/>` +
    label +
    `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${o.background}"/>` +
    `</g>`;

  const css = `.disc{transform-box:fill-box;transform-origin:center;animation:spin 3.2s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

  let text: string;
  if (hasTrack) {
    const textY = o.showProgress ? 0 : 7;
    text =
      equalizer(textX, 24 + textY, spinning) +
      `<g class="t">` +
      `<text class="muted" x="${textX + 16}" y="${33 + textY}" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
      `<text class="fg" x="${textX}" y="${60 + textY}" font-size="16" font-weight="600">${clip(now.title, 28)}</text>` +
      `<text class="muted" x="${textX}" y="${80 + textY}" font-size="13">${clip(now.artist, 34)}</text>` +
      `</g>` +
      (o.showProgress ? progressBar(textX, 98, barWidth, now) : '');
  } else {
    text = `<text class="t muted" x="${textX}" y="${cy}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`;
  }

  const body =
    stylesheet(o, css + (hasTrack ? progressCss(now, barWidth) : '')) +
    `<defs><clipPath id="label"><circle cx="${cx}" cy="${cy}" r="19"/></clipPath></defs>` +
    frame(width, height, 16, o) +
    disc +
    text;

  return svgDocument(width, height, o.scale, body);
}

const RENDERERS: Record<CardStyle, (now: NowPlaying, o: CardOptions) => string> = {
  card: renderCard,
  compact: renderCompact,
  vinyl: renderVinyl,
};

/** The "Now playing on Spotify" card for /spotify. */
export function renderSpotifyCard(now: NowPlaying, options: CardOptions): string {
  return RENDERERS[options.style](now, options);
}
