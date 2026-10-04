import { svgDocument } from '../../badge/svg.js';
import { graphemes } from '../../lib/text.js';
import {
  clip,
  coverImage,
  equalizer,
  frame,
  hasTrack,
  isPlaying,
  MESSAGES,
  messageCard,
  progressBar,
  progressCss,
  STATUS,
  stylesheet,
  type Renderer,
} from '../card-kit.js';

/** Cover, status, title, artist and a progress bar. */
export const renderCard: Renderer = (now, o) => {
  const width = 400;
  const height = 104;
  const pad = 14;
  const cover = 76;
  if (!hasTrack(now)) return svgDocument(width, height, o.scale, messageCard(now, o));

  const textX = o.showCover ? pad + cover + 16 : pad + 6;
  const barWidth = width - textX - pad - 6;
  const shift = o.showProgress ? 0 : 6;

  const body =
    stylesheet(o, progressCss(now, barWidth)) +
    `<defs><clipPath id="cover"><rect x="${pad}" y="${pad}" width="${cover}" height="${cover}" rx="8"/></clipPath></defs>` +
    frame(width, height, 14, o) +
    (o.showCover ? coverImage(now, pad, pad, cover, 'cover') : '') +
    equalizer(textX, pad + 2 + shift, isPlaying(now)) +
    `<g class="t">` +
    `<text class="muted" x="${textX + 16}" y="${pad + 11 + shift}" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
    `<text class="fg" x="${textX}" y="${pad + 36 + shift}" font-size="15" font-weight="600">${clip(now.title, o.showCover ? 34 : 42)}</text>` +
    `<text class="muted" x="${textX}" y="${pad + 55 + shift}" font-size="13">${clip(now.artist, o.showCover ? 40 : 50)}</text>` +
    `</g>` +
    (o.showProgress ? progressBar(textX, height - pad - 6, barWidth, now) : '');

  return svgDocument(width, height, o.scale, body);
};

/** One slim line: "Title · Artist", sized to its text. */
export const renderCompact: Renderer = (now, o) => {
  const height = 40;
  const track = hasTrack(now);
  const withCover = track && o.showCover;
  const left = withCover ? 40 : 16;
  const text = track ? `${now.title} · ${now.artist}` : MESSAGES[now.state];
  const width = Math.min(Math.max(left + 16 + graphemes(text).slice(0, 48).length * 7 + 18, 220), 460);

  const body =
    stylesheet(o) +
    `<defs><clipPath id="cover"><circle cx="22" cy="20" r="13"/></clipPath></defs>` +
    frame(width, height, 20, o) +
    (withCover ? coverImage(now, 9, 7, 26, 'cover') : '') +
    equalizer(left, 15, isPlaying(now)) +
    `<text class="t ${track ? 'fg' : 'muted'}" x="${left + 18}" y="${height / 2}" dominant-baseline="central" font-size="13" font-weight="${track ? 500 : 400}">${clip(text, 48)}</text>`;

  return svgDocument(width, height, o.scale, body);
};

/** A record that spins while the song plays, with the cover as its label. */
export const renderVinyl: Renderer = (now, o) => {
  const width = 400;
  const height = 124;
  const cx = 62;
  const cy = height / 2;
  const track = hasTrack(now);
  const spinning = isPlaying(now);
  const textX = 128;
  const barWidth = width - textX - 22;

  const grooves = [44, 38, 32, 26].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".07"/>`).join('');
  const label =
    track && o.showCover && now.cover
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

  const spin = `.disc{transform-box:fill-box;transform-origin:center;animation:spin 3.2s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

  let text: string;
  if (track) {
    const shift = o.showProgress ? 0 : 7;
    text =
      equalizer(textX, 24 + shift, spinning) +
      `<g class="t">` +
      `<text class="muted" x="${textX + 16}" y="${33 + shift}" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
      `<text class="fg" x="${textX}" y="${60 + shift}" font-size="16" font-weight="600">${clip(now.title, 28)}</text>` +
      `<text class="muted" x="${textX}" y="${80 + shift}" font-size="13">${clip(now.artist, 34)}</text>` +
      `</g>` +
      (o.showProgress ? progressBar(textX, 98, barWidth, now) : '');
  } else {
    text = `<text class="t muted" x="${textX}" y="${cy}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`;
  }

  const body =
    stylesheet(o, spin + progressCss(now, barWidth)) +
    `<defs><clipPath id="label"><circle cx="${cx}" cy="${cy}" r="19"/></clipPath></defs>` +
    frame(width, height, 16, o) +
    disc +
    text;

  return svgDocument(width, height, o.scale, body);
};
