/** Wraps badge content in an <svg> drawn at `width`×`height` and displayed at `scale`. */
export function svgDocument(width: number, height: number, scale: number, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width * scale)}" ` +
    `height="${round(height * scale)}" viewBox="0 0 ${width} ${height}">${body}</svg>`
  );
}

/** Shown when rendering fails, so an embed never ends up as a broken image icon. */
export const ERROR_BADGE = svgDocument(
  80,
  28,
  1,
  '<rect width="80" height="28" rx="6" fill="#3b1219"/>' +
    '<text x="40" y="18" fill="#ff8a9a" font-family="sans-serif" font-size="12" text-anchor="middle">error</text>'
);

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
