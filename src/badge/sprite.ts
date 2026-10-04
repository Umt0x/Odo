import type { SpriteStyle } from './options.js';
import { svgDocument } from './svg.js';

/** Base64 data URIs per image, built on first use and kept for the lifetime of the isolate. */
const dataUris = new WeakMap<ArrayBuffer, string>();

function dataUri(image: ArrayBuffer): string {
  let uri = dataUris.get(image);
  if (!uri) {
    uri = `data:image/png;base64,${toBase64(new Uint8Array(image))}`;
    dataUris.set(image, uri);
  }
  return uri;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Lays the count out as a row of digit images, one fixed-size cell per digit. */
export function renderSpriteBadge(count: number, style: SpriteStyle, scale: number): string {
  const { cell, images } = style.theme;
  const digits = String(count).padStart(style.digits, '0').split('');
  const rendering = style.pixelated ? ' style="image-rendering:pixelated"' : '';

  const body = digits
    .map(
      (digit, i) =>
        `<image x="${i * cell.width}" width="${cell.width}" height="${cell.height}" ` +
        `href="${dataUri(images[Number(digit)])}"${rendering}/>`
    )
    .join('');

  return svgDocument(cell.width * digits.length, cell.height, scale, body);
}
