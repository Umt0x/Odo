import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en.js';
import { findLocale, LOCALES, negotiateLocale } from '../src/i18n/index.js';

describe('i18n', () => {
  it.each(LOCALES.map((l) => [l.code, l] as const))('%s translates every string', (_code, locale) => {
    expect(Object.keys(locale.messages).sort()).toEqual(Object.keys(en).sort());
  });

  it('matches regional and script variants to a supported language', () => {
    expect(findLocale('pt-BR')?.code).toBe('pt');
    expect(findLocale('zh-Hans-CN')?.code).toBe('zh');
    expect(findLocale('xx')).toBeUndefined();
  });

  it('negotiates the best supported language by quality', () => {
    expect(negotiateLocale('xx, de;q=0.5, fr;q=0.8')?.code).toBe('fr');
    expect(negotiateLocale('xx, yy;q=0.5')).toBeUndefined();
  });
});
