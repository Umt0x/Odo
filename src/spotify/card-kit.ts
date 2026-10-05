import { escapeXml, graphemes } from '../lib/text.js';
import type { NowPlaying } from './spotify-account.js';

/** Building blocks shared by every card style in ./styles. */

export interface CardOptions {
  style: string;
  background: string;
  foreground: string;
  accent: string;
  showCover: boolean;
  showProgress: boolean;
  scale: number;
  /** Which Umt0x listening character the mascot style shows. */
  mascot: Mascot;
}

export const MASCOTS = ['dragon', 'robot', 'alien', 'cat', 'spirit', 'cup', 'monster'] as const;
export type Mascot = (typeof MASCOTS)[number];

export type Track = Extract<NowPlaying, { title: string }>;
export type Renderer = (now: NowPlaying, o: CardOptions) => string;

export const FONT = '-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif';
export const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

export const STATUS: Record<Track['state'], string> = {
  playing: 'Now playing',
  paused: 'Paused',
  recent: 'Last played',
};

export const MESSAGES: Record<Exclude<NowPlaying['state'], Track['state']>, string> = {
  disconnected: 'Spotify is not connected yet',
  idle: 'Nothing played on Spotify yet',
  unavailable: 'Spotify is not reachable right now',
};

export function hasTrack(now: NowPlaying): now is Track {
  return 'title' in now;
}

export function isPlaying(now: NowPlaying): boolean {
  return hasTrack(now) && now.state === 'playing';
}

/** SVG text can't ellipsize itself, so long titles are cut by character count. */
export function clip(text: string, max: number): string {
  const chars = graphemes(text);
  return escapeXml(chars.length > max ? `${chars.slice(0, max - 1).join('').trimEnd()}…` : text);
}

export function progressOf(now: Track): number {
  return now.durationMs > 0 ? Math.min(now.progressMs / now.durationMs, 1) : 0;
}

export function remainingSeconds(now: Track): number {
  return Math.max((now.durationMs - now.progressMs) / 1000, 0);
}

/** 83 000 ms -> "01:23". */
export function clock(ms: number): string {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Shared CSS. Muted text, borders and tracks are the foreground color at lower
 * opacity, so any background/foreground pair stays readable.
 */
export function stylesheet(o: CardOptions, extra = ''): string {
  return (
    `<style>` +
    `.t{font-family:${FONT}}.m{font-family:${MONO}}.fg{fill:${o.foreground}}.muted{fill:${o.foreground};fill-opacity:.6}` +
    `.line{fill:${o.foreground};fill-opacity:.13}.accent{fill:${o.accent}}` +
    `.eq{transform-box:fill-box;transform-origin:bottom}` +
    `@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}}` +
    extra +
    `</style>`
  );
}

export function frame(width: number, height: number, radius: number, o: CardOptions): string {
  return (
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="${o.background}"/>` +
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${o.foreground}" stroke-opacity=".12"/>`
  );
}

/** Three bouncing bars while music plays; still otherwise. */
export function equalizer(x: number, y: number, animated: boolean): string {
  return [0, 1, 2]
    .map((i) => {
      const style = animated ? ` style="animation:eq ${0.9 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate"` : '';
      return `<rect class="eq accent" x="${x + i * 4}" y="${y}" width="2.5" height="10" rx="1"${style}/>`;
    })
    .join('');
}

/** A track with a fill that keeps moving to the end of the song while it plays (needs progressCss). */
export function progressBar(x: number, y: number, width: number, now: Track, height = 3): string {
  const playing = now.state === 'playing';
  return (
    `<rect class="line" x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}"/>` +
    `<rect class="${playing ? 'accent progress' : 'muted'}" x="${x}" y="${y}" width="${(width * progressOf(now)).toFixed(1)}" height="${height}" rx="${height / 2}"/>`
  );
}

export function progressCss(now: NowPlaying, width: number): string {
  if (!hasTrack(now) || now.state !== 'playing') return '';
  return `@keyframes progress{to{width:${width}px}}.progress{animation:progress ${remainingSeconds(now).toFixed(0)}s linear forwards}`;
}

export function coverImage(now: Track, x: number, y: number, size: number, clipId: string): string {
  return now.cover
    ? `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${now.cover}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect class="line" x="${x}" y="${y}" width="${size}" height="${size}" rx="${size / 9}"/>`;
}

/** A centered message on the style's own frame, for when there is no track to show. */
export function messageCard(now: Exclude<NowPlaying, Track>, o: CardOptions, width = 400, height = 104, radius = 14): string {
  return (
    stylesheet(o) +
    frame(width, height, radius, o) +
    equalizer(20, height / 2 - 5, false) +
    `<text class="t muted" x="40" y="${height / 2}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`
  );
}
