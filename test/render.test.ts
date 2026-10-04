import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderFlatBadge } from '../src/badge/flat.js';
import { FLAT_COLORS, type FlatStyle, type SpriteStyle } from '../src/badge/options.js';
import { renderSpriteBadge } from '../src/badge/sprite.js';
import { SPRITE_THEMES, findSpriteTheme } from '../src/themes/catalog.js';
import { badgeText, fakeBucket } from './helpers.js';

const flat: FlatStyle = { kind: 'flat', ...FLAT_COLORS, icon: '', animation: 'none' };

function sprite(themeId: string, digits = 1): SpriteStyle {
  return { kind: 'sprite', theme: findSpriteTheme(themeId)!, digits, pixelated: true };
}

describe('flat badge', () => {
  it('shows the count in compact form', () => {
    expect(badgeText(renderFlatBadge(42, flat, 1))).toBe('42');
    expect(badgeText(renderFlatBadge(1337, flat, 1))).toBe('1.3K');
  });

  it('scales the displayed size but not the drawing', () => {
    const svg = renderFlatBadge(1, flat, 2);
    expect(svg).toContain('width="160" height="56" viewBox="0 0 80 28"');
    expect(renderFlatBadge(1, flat, 1.1)).toContain('width="88"');
  });

  it('escapes the icon', () => {
    const svg = renderFlatBadge(1, { ...flat, icon: '<s' }, 1);
    expect(svg).toContain('&lt;s 1');
    expect(svg).not.toContain('<s ');
  });
});

describe('sprite badge', () => {
  it('pads the count and loads each distinct digit from R2 only once', async () => {
    const { bucket, reads } = fakeBucket(['naruto/0.png', 'naruto/1.png']);
    const svg = await renderSpriteBadge(11, sprite('naruto', 7), 1, bucket);

    expect(svg.match(/<image /g)).toHaveLength(7);
    expect(svg).toContain(`viewBox="0 0 ${157 * 7} 400"`);
    expect(reads.sort()).toEqual(['naruto/0.png', 'naruto/1.png']);
  });

  it('leaves a failed digit blank and retries it on the next render', async () => {
    const { bucket } = fakeBucket(['bleach/5.gif'], { failOnce: 'bleach/5.png' });
    const first = await renderSpriteBadge(5, sprite('bleach'), 1, bucket);
    expect(first).not.toContain('<image');

    const second = await renderSpriteBadge(5, sprite('bleach'), 1, bucket);
    expect(second).toContain('href="data:image/gif;base64,');
  });
});

describe('theme catalog', () => {
  const assets = new URL('../src/assets/', import.meta.url);

  function imageSize(bytes: Buffer): [number, number] {
    return bytes[0] === 0x89
      ? [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
      : [bytes.readUInt16LE(6), bytes.readUInt16LE(8)];
  }

  it('lists exactly the themes in src/assets', () => {
    const folders = readdirSync(assets, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(SPRITE_THEMES.map((t) => t.id).sort()).toEqual(folders.sort());
  });

  it.each(SPRITE_THEMES.map((t) => [t.id, t] as const))('%s cell fits its widest and tallest digit', (id, theme) => {
    const sizes = readdirSync(new URL(`${id}/`, assets)).map((file) =>
      imageSize(readFileSync(new URL(`${id}/${file}`, assets)))
    );
    expect(theme.cell).toEqual({
      width: Math.max(...sizes.map(([w]) => w)),
      height: Math.max(...sizes.map(([, h]) => h)),
    });
  });
});
