import { svgDocument } from '../badge/svg.js';
import { escapeXml, graphemes } from '../lib/text.js';
import type { NowPlaying } from './spotify-account.js';

export type CardMode = 'dark' | 'light';

const PALETTES: Record<CardMode, { bg: string; text: string; muted: string; border: string; track: string }> = {
  dark: { bg: '#111113', text: '#fafafa', muted: '#a1a1aa', border: '#27272a', track: '#27272a' },
  light: { bg: '#ffffff', text: '#0a0a0a', muted: '#71717a', border: '#e4e4e7', track: '#e4e4e7' },
};

const SPOTIFY_GREEN = '#1db954';
const WIDTH = 400;
const HEIGHT = 104;
const COVER = 76;
const PAD = 14;
const TEXT_X = PAD + COVER + 16;
const BAR_WIDTH = WIDTH - TEXT_X - PAD - 6;
const FONT = '-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif';

const STATUS: Record<'playing' | 'paused' | 'recent', string> = {
  playing: 'Now playing',
  paused: 'Paused',
  recent: 'Last played',
};

/** SVG text can't ellipsize itself, so long titles are cut by character count. */
function clip(text: string, max: number): string {
  const chars = graphemes(text);
  return escapeXml(chars.length > max ? `${chars.slice(0, max - 1).join('').trimEnd()}…` : text);
}

/** Three bouncing bars while music plays; a still version otherwise. */
function equalizer(x: number, y: number, animated: boolean): string {
  const bars = [0, 1, 2]
    .map((i) => {
      const style = animated ? ` style="animation:eq ${0.9 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate"` : '';
      return `<rect class="eq" x="${x + i * 4}" y="${y}" width="2.5" height="10" rx="1"${style}/>`;
    })
    .join('');
  return `<g fill="${SPOTIFY_GREEN}">${bars}</g>`;
}

/** The "Now playing on Spotify" card for /spotify. */
export function renderSpotifyCard(now: NowPlaying, mode: CardMode, scale = 1): string {
  const p = PALETTES[mode];
  const frame = `<rect x=".5" y=".5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="14" fill="${p.bg}" stroke="${p.border}"/>`;

  if (!('title' in now)) {
    const message = {
      disconnected: 'Spotify is not connected yet',
      idle: 'Nothing played on Spotify yet',
      unavailable: 'Spotify is not reachable right now',
    }[now.state];
    return svgDocument(
      WIDTH,
      HEIGHT,
      scale,
      frame +
        equalizer(PAD + 6, HEIGHT / 2 - 5, false) +
        `<text x="${PAD + 26}" y="${HEIGHT / 2}" dominant-baseline="central" fill="${p.muted}" font-family="${FONT}" font-size="13">${message}</text>`
    );
  }

  const playing = now.state === 'playing';
  const progress = now.durationMs > 0 ? Math.min(now.progressMs / now.durationMs, 1) : 0;
  const remainingSeconds = Math.max((now.durationMs - now.progressMs) / 1000, 0);

  const cover = now.cover
    ? `<image x="${PAD}" y="${PAD}" width="${COVER}" height="${COVER}" href="${now.cover}" clip-path="url(#cover)" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${PAD}" y="${PAD}" width="${COVER}" height="${COVER}" rx="8" fill="${p.track}"/>`;

  // While playing, the bar keeps moving from where the song was to its end.
  const bar =
    `<rect x="${TEXT_X}" y="${HEIGHT - PAD - 6}" width="${BAR_WIDTH}" height="3" rx="1.5" fill="${p.track}"/>` +
    `<rect class="${playing ? 'progress' : ''}" x="${TEXT_X}" y="${HEIGHT - PAD - 6}" width="${(BAR_WIDTH * progress).toFixed(1)}" height="3" rx="1.5" fill="${playing ? SPOTIFY_GREEN : p.muted}"/>`;

  const style =
    `<style>` +
    `.eq{transform-box:fill-box;transform-origin:bottom}` +
    `@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}}` +
    (playing
      ? `@keyframes progress{to{width:${BAR_WIDTH}px}}.progress{animation:progress ${remainingSeconds.toFixed(0)}s linear forwards}`
      : '') +
    `</style>`;

  const body =
    style +
    `<defs><clipPath id="cover"><rect x="${PAD}" y="${PAD}" width="${COVER}" height="${COVER}" rx="8"/></clipPath></defs>` +
    frame +
    cover +
    equalizer(TEXT_X, PAD + 2, playing) +
    `<g font-family="${FONT}">` +
    `<text x="${TEXT_X + 16}" y="${PAD + 11}" fill="${p.muted}" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
    `<text x="${TEXT_X}" y="${PAD + 36}" fill="${p.text}" font-size="15" font-weight="600">${clip(now.title, 34)}</text>` +
    `<text x="${TEXT_X}" y="${PAD + 55}" fill="${p.muted}" font-size="13">${clip(now.artist, 40)}</text>` +
    `</g>` +
    bar;

  return svgDocument(WIDTH, HEIGHT, scale, body);
}
