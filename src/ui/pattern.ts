/**
 * The page background: a tile of outline doodles, like a chat wallpaper.
 * Each icon is drawn on a 24×24 grid and placed on a 320×320 tile.
 */
const ICONS: Record<string, string> = {
  note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  headphones:
    '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  vinyl: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.5"/>',
  robot:
    '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M2 13v3M22 13v3"/>',
  alien:
    '<path d="M12 2C7 2 4 6 4 10c0 5 4 10 8 12 4-2 8-7 8-12 0-4-3-8-8-8z"/><ellipse cx="8.5" cy="11" rx="2" ry="1.3" transform="rotate(25 8.5 11)"/><ellipse cx="15.5" cy="11" rx="2" ry="1.3" transform="rotate(-25 15.5 11)"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  play: '<path d="M6 4l13 8-13 8z"/>',
};

/** [icon, x, y, rotation in degrees] on the 320×320 tile. */
const LAYOUT: [keyof typeof ICONS, number, number, number][] = [
  ['note', 18, 22, -12],
  ['star', 112, 14, 8],
  ['eye', 206, 30, 0],
  ['heart', 276, 104, 14],
  ['robot', 30, 112, 6],
  ['vinyl', 132, 96, 0],
  ['code', 214, 128, -8],
  ['sparkle', 70, 196, 0],
  ['alien', 166, 186, -10],
  ['hash', 262, 214, 10],
  ['headphones', 12, 266, 8],
  ['play', 110, 270, -6],
  ['star', 214, 262, -14],
];

function tile(stroke: string): string {
  const icons = LAYOUT.map(
    ([icon, x, y, rotation]) =>
      `<g transform="translate(${x} ${y}) rotate(${rotation} 18 18) scale(1.5)">${ICONS[icon]}</g>`
  ).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">` +
    `<g fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${icons}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const PATTERN_LIGHT = tile('rgba(10,10,10,0.07)');
export const PATTERN_DARK = tile('rgba(250,250,250,0.06)');
