import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { DIGIT_THEMES } from '../src/themes/catalog.js';
import { badgeText } from './helpers.js';

describe('pages', () => {
  it('serves the landing page with links to every tool', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');

    const html = await res.text();
    expect(html).toContain('class="wordmark"');
    expect(html).toContain('href="/counter"');
    expect(html).toContain('href="/now-playing"');
    expect(html).toContain('href="https://github.com/Umt0x"');
  });

  it('serves the counter builder with every theme', async () => {
    const html = await (await app.request('/counter')).text();
    expect(html).toContain('<title>Odo');
    expect(html).toMatch(/href="\/counter" aria-current="page"/);
    for (const theme of DIGIT_THEMES) {
      expect(html, theme.id).toContain(`name="theme" value="${theme.id}"`);
    }
  });

  it('serves the Spotify builder without a connected account', async () => {
    const html = await (await app.request('/now-playing')).text();
    expect(html).toMatch(/href="\/now-playing" aria-current="page"/);
    expect(html).toContain('name="style" value="vinyl"');
  });

  it('picks the language from Accept-Language', async () => {
    const res = await app.request('/counter', { headers: { 'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8' } });
    const html = await res.text();
    expect(html).toContain('<html lang="tr"');
    expect(html).toContain('Ziyaretçi sayacı');
  });

  it('remembers ?lang= in a cookie and redirects to the clean URL', async () => {
    const res = await app.request('/counter?lang=ja');
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/counter');
    expect(res.headers.get('Set-Cookie')).toContain('odo_lang=ja');

    const html = await (await app.request('/counter', { headers: { Cookie: 'odo_lang=ja' } })).text();
    expect(html).toContain('<html lang="ja"');
  });

  it('marks right-to-left languages', async () => {
    const html = await (await app.request('/', { headers: { Cookie: 'odo_lang=ar' } })).text();
    expect(html).toContain('<html lang="ar" dir="rtl"');
  });
});

describe('GET /themes', () => {
  it('lists flat and every theme', async () => {
    const { themes } = (await (await app.request('/themes')).json()) as { themes: { id: string }[] };
    expect(themes.map((t) => t.id)).toEqual(['flat', ...DIGIT_THEMES.map((t) => t.id)]);
  });
});

describe('GET /@:handle', () => {
  it('counts visits and returns an SVG that cannot run scripts', async () => {
    const first = await app.request('/@route-user');
    expect(first.status).toBe(200);
    expect(first.headers.get('Content-Type')).toContain('image/svg+xml');
    expect(first.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
    expect(first.headers.get('Cache-Control')).toContain('no-store');
    expect(badgeText(await first.text())).toBe('1');

    const second = await app.request('/@route-user');
    expect(badgeText(await second.text())).toBe('2');
  });

  it('does not count render=true requests', async () => {
    await app.request('/@peek-user');
    const peek = await app.request('/@peek-user?render=true');
    expect(badgeText(await peek.text())).toBe('1');
    expect(peek.headers.get('Cache-Control')).toContain('s-maxage=5');
  });

  it('treats handles case-insensitively', async () => {
    await app.request('/@CaseUser');
    expect(badgeText(await (await app.request('/@caseuser')).text())).toBe('2');
  });

  it('shows a fixed number without counting', async () => {
    expect(badgeText(await (await app.request('/@fixed-user?num=1337')).text())).toBe('1.3K');
    expect(badgeText(await (await app.request('/@fixed-user?render=true')).text())).toBe('0');
  });

  it('rejects bad input with 400', async () => {
    expect((await app.request('/@' + 'a'.repeat(40))).status).toBe(400);
    expect((await app.request('/@!!!')).status).toBe(400);
    expect((await app.request('/@umt?num=abc')).status).toBe(400);
  });

  it('escapes injected markup', async () => {
    const res = await app.request(`/@xss-user?icon=${encodeURIComponent('<script>')}`);
    const svg = await res.text();
    expect(svg).not.toContain('<script');
    expect(svg).toContain('&lt;s');
  });

  it('draws digit themes with custom colors', async () => {
    const res = await app.request('/@glyph-user?theme=led&length=4&num=2026&color=00ff00');
    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain('fill="#00ff00"');
    expect(svg).not.toContain('<image');
  });

  it('serves sprite themes from bundled images', async () => {
    const svg = await (await app.request('/@sprite-user?theme=first-ten&length=4&num=2026')).text();
    expect(svg.match(/<image /g)).toHaveLength(4);
    expect(svg).toContain('href="data:image/png;base64,');
  });

  it('ignores paths without @', async () => {
    expect((await app.request('/umt')).status).toBe(404);
  });
});
