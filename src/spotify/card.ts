import { safeColor } from '../lib/text.js';
import type { CardOptions, Renderer } from './card-kit.js';
import type { NowPlaying } from './spotify-account.js';
import { renderCard, renderCompact, renderVinyl } from './styles/classic.js';
import { renderMascot } from './styles/mascot.js';
import { renderBadge, renderEqualizer, renderIsland } from './styles/minimal.js';
import { renderBlur, renderPlayer, renderPolaroid } from './styles/photo.js';
import { renderCassette, renderLcd, renderTerminal } from './styles/retro.js';

export type { CardOptions } from './card-kit.js';

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

export const MASCOTS = ['dragon', 'robot', 'alien'] as const;
const DEFAULT_MASCOT_DIGIT: Record<(typeof MASCOTS)[number], number> = { dragon: 7, robot: 1, alien: 4 };

type Query = (name: string) => string | undefined;

/** `mascot=dragon`, `robot` or `alien`, optionally with a character number: `dragon-3`. */
function parseMascot(value: string | undefined): CardOptions['mascot'] {
  const match = /^(dragon|robot|alien)(?:-([0-9]))?$/.exec(value ?? '');
  const set = (match?.[1] as CardOptions['mascot']['set'] | undefined) ?? 'dragon';
  return { set, digit: match?.[2] ? Number(match[2]) : DEFAULT_MASCOT_DIGIT[set] };
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
