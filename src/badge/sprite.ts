import type { SpriteStyle } from './options.js';
import { loadDigit } from './sprite-source.js';
import { svgDocument } from './svg.js';

/** Lays the count out as a row of digit images, one fixed-size cell per digit. */
export async function renderSpriteBadge(
  count: number,
  style: SpriteStyle,
  scale: number,
  bucket: R2Bucket | undefined
): Promise<string> {
  const { id, cell } = style.theme;
  const digits = String(count).padStart(style.digits, '0').split('');

  const images = await Promise.all(
    digits.map((digit) =>
      loadDigit(bucket, id, digit).catch((err) => {
        console.error(`Could not load digit ${digit} of theme "${id}":`, err);
        return null;
      })
    )
  );

  const rendering = style.pixelated ? ' style="image-rendering:pixelated"' : '';
  const body = images
    .map((uri, i) =>
      uri ? `<image x="${i * cell.width}" width="${cell.width}" height="${cell.height}" href="${uri}"${rendering}/>` : ''
    )
    .join('');

  return svgDocument(cell.width * digits.length, cell.height, scale, body);
}
