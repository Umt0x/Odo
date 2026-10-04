import { svgDocument } from '../../badge/svg.js';
import {
  clip,
  clock,
  equalizer,
  hasTrack,
  isPlaying,
  MESSAGES,
  messageCard,
  progressCss,
  progressOf,
  remainingSeconds,
  STATUS,
  stylesheet,
  type Renderer,
} from '../card-kit.js';

/* ------------------------------------------------------------------- blur */

/** The cover, blurred, becomes the card's background, so every song brings its own colors. */
export const renderBlur: Renderer = (now, o) => {
  const width = 400;
  const height = 132;
  const pad = 16;
  const cover = 100;
  if (!hasTrack(now)) return svgDocument(width, height, o.scale, messageCard(now, o, width, height, 18));

  const art = o.showCover && now.cover;
  const textX = art ? pad + cover + 18 : pad + 6;
  const barWidth = width - textX - pad - 4;
  const backdrop = now.cover
    ? `<image x="-40" y="-134" width="480" height="400" href="${now.cover}" preserveAspectRatio="xMidYMid slice" filter="url(#blur)"/>`
    : `<rect width="${width}" height="${height}" fill="${o.accent}"/>`;

  const body =
    stylesheet(o, progressCss(now, barWidth)) +
    `<defs>` +
    `<clipPath id="card"><rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="18"/></clipPath>` +
    `<clipPath id="cover"><rect x="${pad}" y="${pad}" width="${cover}" height="${cover}" rx="10"/></clipPath>` +
    `<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="24"/></filter>` +
    `<filter id="lift"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity=".35"/></filter>` +
    `</defs>` +
    `<g clip-path="url(#card)">` +
    `<rect width="${width}" height="${height}" fill="${o.background}"/>` +
    backdrop +
    // Tint keeps the text readable on any cover.
    `<rect width="${width}" height="${height}" fill="${o.background}" fill-opacity=".5"/>` +
    `</g>` +
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="18" fill="none" stroke="${o.foreground}" stroke-opacity=".15"/>` +
    (art
      ? `<g filter="url(#lift)"><image x="${pad}" y="${pad}" width="${cover}" height="${cover}" href="${now.cover}" clip-path="url(#cover)" preserveAspectRatio="xMidYMid slice"/></g>`
      : '') +
    equalizer(textX, pad + 6, isPlaying(now)) +
    `<g class="t">` +
    `<text class="fg" x="${textX + 16}" y="${pad + 15}" font-size="11" font-weight="600" letter-spacing=".4" fill-opacity=".8">${STATUS[now.state].toUpperCase()}</text>` +
    `<text class="fg" x="${textX}" y="${pad + 46}" font-size="19" font-weight="700">${clip(now.title, art ? 22 : 32)}</text>` +
    `<text class="fg" x="${textX}" y="${pad + 68}" font-size="14" fill-opacity=".75">${clip(now.artist, art ? 30 : 42)}</text>` +
    `</g>` +
    (o.showProgress
      ? `<rect x="${textX}" y="${height - pad - 8}" width="${barWidth}" height="4" rx="2" fill="${o.foreground}" fill-opacity=".25"/>` +
        `<rect class="${isPlaying(now) ? 'progress' : ''}" x="${textX}" y="${height - pad - 8}" width="${(barWidth * progressOf(now)).toFixed(1)}" height="4" rx="2" fill="${o.foreground}"/>`
      : '');

  return svgDocument(width, height, o.scale, body);
};

/* --------------------------------------------------------------- polaroid */

const HANDWRITING = "'Segoe Print','Bradley Hand','Marker Felt','Comic Sans MS',cursive";

/** A slightly tilted instant photo of the cover, captioned by hand. Tall: made for sidebars. */
export const renderPolaroid: Renderer = (now, o) => {
  const width = 264;
  const height = 320;
  const photo = { x: 28, y: 28, size: 208 };
  const track = hasTrack(now);

  const picture =
    track && o.showCover && now.cover
      ? `<image x="${photo.x}" y="${photo.y}" width="${photo.size}" height="${photo.size}" href="${now.cover}" clip-path="url(#photo)" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect x="${photo.x}" y="${photo.y}" width="${photo.size}" height="${photo.size}" rx="2" class="accent" fill-opacity=".85"/>` +
        `<g transform="translate(${photo.x + photo.size / 2 - 20} ${photo.y + photo.size / 2 - 20}) scale(3.4)">${equalizer(0, 0, isPlaying(now))}</g>`;

  const caption = track
    ? `<text x="132" y="${photo.y + photo.size + 36}" text-anchor="middle" font-family="${HANDWRITING}" font-size="19" class="fg">${clip(now.title, 22)}</text>` +
      `<text x="132" y="${photo.y + photo.size + 58}" text-anchor="middle" class="t muted" font-size="12">${clip(now.artist, 32)}</text>`
    : `<text x="132" y="${photo.y + photo.size + 44}" text-anchor="middle" class="t muted" font-size="12">${MESSAGES[now.state]}</text>`;

  const body =
    stylesheet(o) +
    `<defs><clipPath id="photo"><rect x="${photo.x}" y="${photo.y}" width="${photo.size}" height="${photo.size}" rx="2"/></clipPath></defs>` +
    `<g transform="rotate(-2 132 160)">` +
    `<rect x="14" y="18" width="236" height="290" rx="4" fill="#000" fill-opacity=".14"/>` +
    `<rect x="12" y="12" width="240" height="292" rx="4" fill="${o.background}" stroke="${o.foreground}" stroke-opacity=".1"/>` +
    picture +
    caption +
    // A strip of tape holding it up.
    `<rect x="100" y="2" width="64" height="20" rx="2" fill="${o.foreground}" fill-opacity=".12" transform="rotate(4 132 12)"/>` +
    `</g>`;

  return svgDocument(width, height, o.scale, body);
};

/* ----------------------------------------------------------------- player */

/** Big cover on the left; title and artist in one rounded block, the scrubber with times in another. */
export const renderPlayer: Renderer = (now, o) => {
  const width = 520;
  const pad = 16;
  const coverSize = 168;
  const track = hasTrack(now);
  const withProgress = track && o.showProgress;
  const withCover = o.showCover;
  const blockX = withCover ? pad + coverSize + 16 : pad;
  const blockW = width - blockX - pad;
  const topH = 100;
  const height = withProgress ? pad * 2 + coverSize : pad * 2 + topH;

  const cover = withCover
    ? track && now.cover
      ? `<image x="${pad}" y="${pad}" width="${coverSize}" height="${height - pad * 2}" href="${now.cover}" clip-path="url(#cover)" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect x="${pad}" y="${pad}" width="${coverSize}" height="${height - pad * 2}" rx="6" class="accent" fill-opacity=".8"/>`
    : '';

  const top =
    `<rect x="${blockX}" y="${pad}" width="${blockW}" height="${topH}" rx="28" fill="${o.background}" stroke="${o.foreground}" stroke-opacity=".12"/>` +
    (track
      ? `<text class="t fg" x="${blockX + 30}" y="${pad + 52}" font-size="28" font-weight="700" letter-spacing="-.5">${clip(now.title, withCover ? 15 : 24)}</text>` +
        `<text class="t muted" x="${blockX + 30}" y="${pad + 80}" font-size="15" font-weight="500">${clip(now.artist, withCover ? 30 : 46)}</text>`
      : `<text class="t muted" x="${blockX + 30}" y="${pad + topH / 2}" dominant-baseline="central" font-size="14">${MESSAGES[now.state]}</text>`);

  let bottom = '';
  let css = '';
  if (withProgress) {
    const y = pad + topH + 8;
    const h = coverSize - topH - 8;
    const barX = blockX + 28;
    const barW = blockW - 56;
    const barY = y + 22;
    const done = barW * progressOf(now);
    bottom =
      `<rect x="${blockX}" y="${y}" width="${blockW}" height="${h}" rx="28" fill="${o.background}" stroke="${o.foreground}" stroke-opacity=".12"/>` +
      `<rect x="${barX}" y="${barY}" width="${barW}" height="7" rx="3.5" fill="${o.foreground}" fill-opacity=".3"/>` +
      `<rect class="progress" x="${barX}" y="${barY}" width="${done.toFixed(1)}" height="7" rx="3.5" fill="${o.foreground}"/>` +
      `<g class="knob"><circle cx="${(barX + done).toFixed(1)}" cy="${barY + 3.5}" r="9" fill="${o.foreground}"/></g>` +
      `<text class="m fg" x="${barX}" y="${barY + 30}" font-size="11" fill-opacity=".85">${clock(now.progressMs)}</text>` +
      `<text class="m fg" x="${barX + barW}" y="${barY + 30}" font-size="11" text-anchor="end" fill-opacity=".85">${clock(now.durationMs)}</text>`;
    if (isPlaying(now)) {
      const seconds = remainingSeconds(now).toFixed(0);
      css =
        `@keyframes progress{to{width:${barW}px}}.progress{animation:progress ${seconds}s linear forwards}` +
        `@keyframes knob{to{transform:translateX(${(barW - done).toFixed(1)}px)}}.knob{animation:knob ${seconds}s linear forwards}`;
    }
  }

  const body =
    stylesheet(o, css) +
    `<defs><clipPath id="cover"><rect x="${pad}" y="${pad}" width="${coverSize}" height="${height - pad * 2}" rx="6"/></clipPath></defs>` +
    cover +
    top +
    bottom;

  return svgDocument(width, height, o.scale, body);
};
