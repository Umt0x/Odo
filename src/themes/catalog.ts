export interface SpriteTheme {
  id: string;
  label: string;
  /** Size of one digit cell: the widest and the tallest digit image in the set. */
  cell: { width: number; height: number };
}

/**
 * Every sprite theme the worker serves, in the order the builder shows them.
 *
 * This list is also the allow-list for the `theme` query parameter, so R2 keys
 * are never built from arbitrary input. To add a theme: drop `0-9.png|gif` into
 * `src/assets/<id>/`, register it here and run `npm run sprites:upload`.
 * The test suite checks that the cell sizes below match the images on disk.
 */
export const SPRITE_THEMES: readonly SpriteTheme[] = [
  { id: 'naruto', label: 'Naruto', cell: { width: 157, height: 400 } },
  { id: 'onepiece', label: 'One Piece', cell: { width: 269, height: 345 } },
  { id: 'bleach', label: 'Bleach', cell: { width: 210, height: 345 } },
  { id: 'dragonball', label: 'Dragon Ball', cell: { width: 260, height: 345 } },
  { id: 'aot', label: 'Attack on Titan', cell: { width: 262, height: 345 } },
  { id: 'codegeass', label: 'Code Geass', cell: { width: 164, height: 323 } },
  { id: 'l', label: 'Death Note', cell: { width: 140, height: 249 } },
  { id: 'monster', label: 'Monster', cell: { width: 96, height: 96 } },
  { id: 'adventuretime', label: 'Adventure Time', cell: { width: 243, height: 330 } },
  { id: 'gumball', label: 'Gumball', cell: { width: 245, height: 325 } },
];

const themesById = new Map(SPRITE_THEMES.map((theme) => [theme.id, theme]));

export function findSpriteTheme(id: string | undefined): SpriteTheme | undefined {
  return id ? themesById.get(id) : undefined;
}
