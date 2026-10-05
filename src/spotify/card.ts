import { safeColor } from '../lib/text.js';
import { MASCOTS, type CardOptions, type Mascot, type Renderer } from './card-kit.js';
import type { NowPlaying } from './spotify-account.js';
import { renderCard, renderCompact, renderVinyl } from './styles/classic.js';
import { renderMascot } from './styles/mascot.js';
import { renderBadge, renderEqualizer, renderIsland } from './styles/minimal.js';
import { renderBlur, renderPlayer, renderPolaroid } from './styles/photo.js';
import { renderCassette, renderLcd, renderTerminal } from './styles/retro.js';

export type { CardOptions } from './card-kit.js';
export { MASCOTS } from './card-kit.js';

/** Every card style, in the order the builder shows them. */
const RENDERERS = {
  card: renderCard,
  compact: renderCompact,
  vinyl: renderVinyl,
  cassette: renderCassette,
  blur: renderBlur,
  terminal: renderTerminal,
  lcd: renderLcd,
  polaroid: renderPolaroid,
  badge: renderBadge,
  equalizer: renderEqualizer,
  mascot: renderMascot,
  island: renderIsland,
  player: renderPlayer,
} satisfies Record<string, Renderer>;

export type CardStyle = keyof typeof RENDERERS;
export const CARD_STYLES = Object.keys(RENDERERS) as CardStyle[];

export const SPOTIFY_GREEN = '#1db954';

/** `mode=dark|light` picks one of these; `bg` and `color` override it. */
export const CARD_PRESETS = {
  dark: { background: '#111113', foreground: '#fafafa' },
  light: { background: '#ffffff', foreground: '#0a0a0a' },
} as const;

type Query = (name: string) => string | undefined;

/**
 * `mascot=` one of MASCOTS. Older links may carry a character number
 * (`dragon-3`); there is one listening character per set now, so it is ignored.
 */
function parseMascot(value: string | undefined): Mascot {
  const name = (value ?? '').replace(/-[0-9]$/, '');
  return MASCOTS.find((mascot) => mascot === name) ?? 'dragon';
}

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
    mascot: parseMascot(query('mascot')),
  };
}

/** The "Now playing on Spotify" card for /spotify. */
export function renderSpotifyCard(now: NowPlaying, options: CardOptions): string {
  return (RENDERERS[options.style as CardStyle] ?? renderCard)(now, options);
}
