import listening from '../../assets/listening/index.js';
import { dataUri } from '../../badge/sprite.js';
import { svgDocument } from '../../badge/svg.js';
import { clip, equalizer, hasTrack, isPlaying, MESSAGES, STATUS, stylesheet, type Renderer } from '../card-kit.js';

/** PNG width and height sit at bytes 16-23 of the header. */
function pngSize(image: ArrayBuffer): { width: number; height: number } {
  const header = new DataView(image);
  return { width: header.getUint32(16), height: header.getUint32(20) };
}

/** An Umt0x character with headphones sits next to a speech bubble with the song; notes float up while it plays. */
export const renderMascot: Renderer = (now, o) => {
  const width = 420;
  const height = 140;
  const playing = isPlaying(now);

  // The images are stored at twice this height, so they stay sharp on high-density screens.
  const image = listening[o.mascot];
  const size = pngSize(image);
  const h = 122;
  const characterWidth = Math.round((size.width / size.height) * h);
  const character = `<image x="14" y="${height - h - 6}" width="${characterWidth}" height="${h}" href="${dataUri(image)}"/>`;

  const notes = playing
    ? ['♪', '♫', '♪']
        .map(
          (note, i) =>
            `<text class="note t accent" x="${24 + i * 26}" y="34" font-size="${14 + (i % 2) * 4}" style="animation-delay:${(i * 0.9).toFixed(1)}s">${note}</text>`
        )
        .join('')
    : '';

  const bubbleX = 14 + characterWidth + 18;
  const bubbleW = width - bubbleX - 14;
  const textX = bubbleX + 20;

  const inside = hasTrack(now)
    ? equalizer(textX, 44, playing) +
      `<g class="t">` +
      `<text class="muted" x="${textX + 16}" y="53" font-size="11" font-weight="500" letter-spacing=".3">${STATUS[now.state]} on Spotify</text>` +
      `<text class="fg" x="${textX}" y="80" font-size="17" font-weight="700">${clip(now.title, 24)}</text>` +
      `<text class="muted" x="${textX}" y="100" font-size="13">${clip(now.artist, 32)}</text>` +
      `</g>`
    : `<text class="t muted" x="${textX}" y="${height / 2}" dominant-baseline="central" font-size="13">${MESSAGES[now.state]}</text>`;

  const css =
    `.note{opacity:0;animation:float 2.7s ease-in infinite}` +
    `@keyframes float{0%{opacity:0;transform:translateY(14px)}25%{opacity:1}100%{opacity:0;transform:translateY(-14px)}}`;

  const body =
    stylesheet(o, css) +
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="18" fill="${o.background}" stroke="${o.foreground}" stroke-opacity=".12"/>` +
    character +
    notes +
    // Speech bubble, its tail pointing at the character.
    `<path d="M${bubbleX} 82 L${bubbleX - 12} 92 L${bubbleX} 96 Z" fill="${o.foreground}" fill-opacity=".07"/>` +
    `<rect x="${bubbleX}" y="22" width="${bubbleW}" height="96" rx="16" fill="${o.foreground}" fill-opacity=".07"/>` +
    inside;

  return svgDocument(width, height, o.scale, body);
};
