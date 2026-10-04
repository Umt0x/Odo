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
  progressBar,
  progressCss,
  STATUS,
  stylesheet,
  type Renderer,
} from '../card-kit.js';

/* ------------------------------------------------------------------ badge */

/** Spotify's mark, simplified: a disc with three arcs. */
function spotifyMark(cx: number, cy: number, disc: string, arcs: string): string {
  return (
    `<circle cx="${cx}" cy="${cy}" r="7" fill="${disc}"/>` +
    `<g fill="none" stroke="${arcs}" stroke-linecap="round">` +
    `<path d="M${cx - 4} ${cy - 2.2}q4-1.6 8 .4" stroke-width="1.6"/>` +
    `<path d="M${cx - 3.4} ${cy + 0.6}q3.4-1.2 6.6.4" stroke-width="1.4"/>` +
    `<path d="M${cx - 2.8} ${cy + 3}q2.8-.9 5.4.3" stroke-width="1.2"/>` +
    `</g>`
  );
}

/** Two-part badge like the classic shields: "Spotify | Title — Artist". Sits next to other badges. */
export const renderBadge: Renderer = (now, o) => {
  const height = 28;
  const text = hasTrack(now) ? `${now.title} — ${now.artist}` : MESSAGES[now.state];
  const shown = graphemes(text).slice(0, 42).length;
  const left = 86;
  const right = Math.max(shown * 6.9 + 22, 80);
  const width = Math.round(left + right);

  const body =
    stylesheet(o) +
    `<defs><clipPath id="pill"><rect width="${width}" height="${height}" rx="6"/></clipPath></defs>` +
    `<g clip-path="url(#pill)">` +
    `<rect width="${left}" height="${height}" class="accent"/>` +
    `<rect x="${left}" width="${right}" height="${height}" fill="${o.background}"/>` +
    `</g>` +
    spotifyMark(17, 14, o.background, o.accent) +
    `<text class="t" x="30" y="14" dominant-baseline="central" font-size="12" font-weight="700" fill="${o.background}">Spotify</text>` +
    `<text class="t fg" x="${left + 11}" y="14" dominant-baseline="central" font-size="12" font-weight="500">${clip(text, 42)}</text>`;

  return svgDocument(width, height, o.scale, body);
};

/* ----------------------------------------------------------------- island */

/** A floating pill like a phone's dynamic island: it opens up, then the waveform keeps moving. */
export const renderIsland: Renderer = (now, o) => {
  const width = 380;
  const height = 72;
  const track = hasTrack(now);
  const playing = isPlaying(now);
  const withCover = track && o.showCover;
  const textX = withCover ? 76 : 30;

  const wave = [0, 1, 2, 3, 4]
    .map((i) => {
      const style = playing ? ` style="animation:wave ${0.7 + (i % 3) * 0.18}s ease-in-out ${i * 0.11}s infinite alternate"` : '';
      return `<rect class="bar accent" x="${312 + i * 7}" y="24" width="4" height="24" rx="2"${style}/>`;
    })
    .join('');

  const css =
    `.pill{transform-box:fill-box;transform-origin:center;animation:open .7s cubic-bezier(.2,.8,.2,1) both}` +
    `@keyframes open{from{transform:scaleX(.32) scaleY(.8)}}` +
    `.content{animation:show .45s .4s both}@keyframes show{from{opacity:0}}` +
    `.bar{transform-box:fill-box;transform-origin:center;transform:scaleY(.35)}` +
    `@keyframes wave{from{transform:scaleY(.25)}to{transform:scaleY(1)}}`;

  const content = track
    ? (withCover ? coverImage(now, 16, 14, 44, 'cover') : '') +
      `<text class="t fg" x="${textX}" y="32" font-size="14" font-weight="600">${clip(now.title, withCover ? 28 : 34)}</text>` +
      `<text class="t muted" x="${textX}" y="51" font-size="12">${clip(now.artist, withCover ? 32 : 38)}</text>` +
      wave
    : `<text class="t muted" x="30" y="${height / 2}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`;

  const body =
    stylesheet(o, css) +
    `<defs><clipPath id="cover"><circle cx="38" cy="36" r="22"/></clipPath></defs>` +
    `<g class="pill"><rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${height / 2}" fill="${o.background}" stroke="${o.foreground}" stroke-opacity=".1"/></g>` +
    `<g class="content">${content}</g>`;

  return svgDocument(width, height, o.scale, body);
};

/* -------------------------------------------------------------- equalizer */

/** Bars bounce across the whole card behind the song. */
export const renderEqualizer: Renderer = (now, o) => {
  const width = 400;
  const height = 112;
  const track = hasTrack(now);
  const playing = isPlaying(now);
  const bars = 40;
  const barWidth = width / bars;

  // Deterministic "random" heights and speeds so the card looks the same on every load.
  const columns = Array.from({ length: bars }, (_, i) => {
    const h = 18 + Math.abs(Math.sin(i * 1.7) * 38) + Math.abs(Math.cos(i * 0.6) * 18);
    const style = playing ? ` style="animation:eq ${(0.6 + Math.abs(Math.sin(i * 2.3)) * 0.9).toFixed(2)}s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate"` : '';
    return `<rect class="eq accent" x="${(i * barWidth + 1).toFixed(1)}" y="${(height - h).toFixed(1)}" width="${(barWidth - 2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5"${style}/>`;
  }).join('');

  const withCover = track && o.showCover;
  const textX = withCover ? 92 : 22;
  const barLength = width - textX - 22;

  const text = track
    ? (withCover ? coverImage(now, 18, 18, 60, 'cover') : '') +
      `<g class="t">` +
      `<text class="muted" x="${textX}" y="30" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
      `<text class="fg" x="${textX}" y="54" font-size="17" font-weight="700">${clip(now.title, withCover ? 30 : 38)}</text>` +
      `<text class="muted" x="${textX}" y="74" font-size="13">${clip(now.artist, withCover ? 38 : 46)}</text>` +
      `</g>` +
      (o.showProgress ? progressBar(textX, 88, barLength, now) : '')
    : equalizer(22, height / 2 - 5, false) +
      `<text class="t muted" x="42" y="${height / 2}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`;

  const body =
    stylesheet(o, progressCss(now, barLength)) +
    `<defs>` +
    `<clipPath id="card"><rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="16"/></clipPath>` +
    `<clipPath id="cover"><rect x="18" y="18" width="60" height="60" rx="8"/></clipPath>` +
    `</defs>` +
    frame(width, height, 16, o) +
    `<g clip-path="url(#card)" opacity=".22">${columns}</g>` +
    text;

  return svgDocument(width, height, o.scale, body);
};
