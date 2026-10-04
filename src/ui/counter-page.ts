import { ANIMATIONS, DIGITS, FLAT_COLORS, MAX_HANDLE_LENGTH } from '../badge/options.js';
import type { Locale, Translate } from '../i18n/index.js';
import { escapeXml } from '../lib/text.js';
import { DIGIT_THEMES } from '../themes/catalog.js';
import { colorSwatch, resultColumn, sizeRow, styleOption, switchRow } from './components.js';
import { renderLayout } from './layout.js';
import { counterScript } from './scripts/counter.js';

const DEFAULT_HANDLE = 'umt0x';
const SAMPLE_COUNT = 2026;

/** Thumbnail for a style option. Uses a fixed number, so browsing styles never counts a visit. */
function sampleBadgeUrl(themeId: string | null): string {
  const params = new URLSearchParams({ num: String(SAMPLE_COUNT) });
  if (themeId) {
    params.set('theme', themeId);
    params.set('length', '4');
  }
  return `/@sample?${params}`;
}

function animationOption(t: Translate, name: (typeof ANIMATIONS)[number]): string {
  return `
                <label><input type="radio" name="animation" value="${name}"${name === 'none' ? ' checked' : ''}><span>${escapeXml(t(`counter.animation.${name}`))}</span></label>`;
}

/** GET /counter — the visitor counter builder. */
export function renderCounterPage(locale: Locale, t: Translate): string {
  const e = (key: Parameters<Translate>[0]) => escapeXml(t(key));
  // `data-kind` tells the browser script which settings to show; drawn themes also carry their default colors.
  const styleOptions = [
    styleOption('theme', 'flat', 'Flat', sampleBadgeUrl(null), true, ' data-kind="flat"'),
    ...DIGIT_THEMES.map((theme) => {
      const colors = theme.kind === 'glyph' ? ` data-color="${theme.colors.foreground}" data-bg="${theme.colors.background}"` : '';
      return styleOption('theme', theme.id, theme.label, sampleBadgeUrl(theme.id), false, ` data-kind="${theme.kind}"${colors}`);
    }),
  ].join('');

  const body = `
    <section class="hero">
      <h1>${e('counter.title')}</h1>
      <p>${e('counter.text')}</p>
    </section>

    <div class="workspace">${resultColumn({
      t,
      handle: DEFAULT_HANDLE,
      previewSrc: `/@${DEFAULT_HANDLE}?render=true`,
      previewAlt: 'Live badge preview',
      readmeText: t('counter.readme'),
    })}

      <form id="builder" class="builder" data-mode="flat" data-default-handle="${DEFAULT_HANDLE}" autocomplete="off">
        <section class="section" aria-labelledby="counter-title">
          <h2 id="counter-title" class="section__title">${e('counter.section')}</h2>
          <div class="panel">
            <label class="row">
              <span class="row__label">${e('counter.handle')}<small>${e('counter.handleHint')}</small></span>
              <span class="input-group"><span aria-hidden="true">@</span><input name="handle" value="${DEFAULT_HANDLE}" maxlength="${MAX_HANDLE_LENGTH}" spellcheck="false" autocapitalize="off"></span>
            </label>
            <label class="row">
              <span class="row__label">${e('counter.fixed')}<small>${e('counter.fixedHint')}</small></span>
              <input class="input" name="num" type="number" min="0" step="1" inputmode="numeric" placeholder="${e('counter.fixedPlaceholder')}">
            </label>
          </div>
        </section>

        <section class="section" aria-labelledby="look-title">
          <h2 id="look-title" class="section__title">${e('form.appearance')}</h2>
          <div class="panel">
            <fieldset class="row row--stacked">
              <legend class="row__label">${e('form.style')}</legend>
              <div class="styles">${styleOptions}
              </div>
            </fieldset>

            <label class="row" data-for="flat">
              <span class="row__label">${e('counter.icon')}<small>${e('counter.iconHint')}</small></span>
              <input class="input" name="icon" maxlength="16" placeholder="${e('counter.iconPlaceholder')}">
            </label>
            <fieldset class="row" data-for="flat glyph">
              <legend class="row__label">${e('form.colors')}</legend>
              <div class="swatches">${colorSwatch('bg', t('form.fill'), FLAT_COLORS.background)}${colorSwatch('color', t('form.text'), FLAT_COLORS.foreground)}${colorSwatch('stroke', t('counter.border'), FLAT_COLORS.border, 'flat')}
              </div>
            </fieldset>
            <fieldset class="row" data-for="flat">
              <legend class="row__label">${e('counter.animation')}</legend>
              <div class="segmented">${ANIMATIONS.map((name) => animationOption(t, name)).join('')}
              </div>
            </fieldset>

            <div class="row" data-for="glyph sprite">
              <span class="row__label" id="digits-label">${e('counter.digits')}<small>${e('counter.digitsHint')}</small></span>
              <div class="stepper" role="group" aria-labelledby="digits-label">
                <button type="button" data-step="-1" aria-label="${e('counter.fewerDigits')}">−</button>
                <input name="digits" type="number" min="${DIGITS.min}" max="${DIGITS.max}" value="${DIGITS.fallback}" aria-labelledby="digits-label">
                <button type="button" data-step="1" aria-label="${e('counter.moreDigits')}">+</button>
              </div>
            </div>${switchRow('pixelated', t('counter.pixelArt'), t('counter.pixelArtHint'), true, 'sprite')}${sizeRow(t)}
          </div>
        </section>
      </form>
    </div>
`;

  return renderLayout({
    locale,
    t,
    page: 'counter',
    title: t('meta.counter.title'),
    description: t('meta.counter.description'),
    body,
    script: counterScript,
  });
}
