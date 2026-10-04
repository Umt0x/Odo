import { en, type MessageKey, type Messages } from './en.js';
import { ar } from './locales/ar.js';
import { de } from './locales/de.js';
import { es } from './locales/es.js';
import { fr } from './locales/fr.js';
import { hi } from './locales/hi.js';
import { id } from './locales/id.js';
import { it } from './locales/it.js';
import { ja } from './locales/ja.js';
import { ko } from './locales/ko.js';
import { nl } from './locales/nl.js';
import { pl } from './locales/pl.js';
import { pt } from './locales/pt.js';
import { ru } from './locales/ru.js';
import { tr } from './locales/tr.js';
import { uk } from './locales/uk.js';
import { vi } from './locales/vi.js';
import { zh } from './locales/zh.js';

export interface Locale {
  code: string;
  /** The language's own name, as shown in the picker. */
  name: string;
  dir: 'ltr' | 'rtl';
  messages: Messages;
}

/**
 * Every UI language, in picker order. To add one: copy src/i18n/locales/tr.ts,
 * translate it and list it here. Missing keys fall back to English.
 */
export const LOCALES: readonly Locale[] = [
  { code: 'en', name: 'English', dir: 'ltr', messages: en },
  { code: 'tr', name: 'Türkçe', dir: 'ltr', messages: tr },
  { code: 'de', name: 'Deutsch', dir: 'ltr', messages: de },
  { code: 'es', name: 'Español', dir: 'ltr', messages: es },
  { code: 'fr', name: 'Français', dir: 'ltr', messages: fr },
  { code: 'pt', name: 'Português', dir: 'ltr', messages: pt },
  { code: 'it', name: 'Italiano', dir: 'ltr', messages: it },
  { code: 'nl', name: 'Nederlands', dir: 'ltr', messages: nl },
  { code: 'pl', name: 'Polski', dir: 'ltr', messages: pl },
  { code: 'ru', name: 'Русский', dir: 'ltr', messages: ru },
  { code: 'uk', name: 'Українська', dir: 'ltr', messages: uk },
  { code: 'ar', name: 'العربية', dir: 'rtl', messages: ar },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr', messages: hi },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr', messages: id },
  { code: 'ja', name: '日本語', dir: 'ltr', messages: ja },
  { code: 'ko', name: '한국어', dir: 'ltr', messages: ko },
  { code: 'zh', name: '中文', dir: 'ltr', messages: zh },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr', messages: vi },
];

export const DEFAULT_LOCALE = LOCALES[0];
export const LOCALE_COOKIE = 'odo_lang';

const localesByCode = new Map(LOCALES.map((locale) => [locale.code, locale]));

/** Matches `pt-BR` to `pt`, `zh-Hans-CN` to `zh` and so on. */
export function findLocale(code: string | undefined | null): Locale | undefined {
  if (!code) return undefined;
  const lower = code.trim().toLowerCase();
  return localesByCode.get(lower) ?? localesByCode.get(lower.split('-')[0]);
}

/** Picks the best supported language from an Accept-Language header. */
export function negotiateLocale(header: string | undefined | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag, q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const locale = findLocale(tag);
    if (locale) return locale;
  }
  return undefined;
}

export type Translate = (key: MessageKey) => string;

export function translator(locale: Locale): Translate {
  return (key) => locale.messages[key] ?? en[key];
}

export type { MessageKey };
