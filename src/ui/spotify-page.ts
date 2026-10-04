import type { Locale, Translate } from '../i18n/index.js';
import { escapeXml } from '../lib/text.js';
import { CARD_PRESETS, CARD_STYLES, MASCOTS, SPOTIFY_GREEN } from '../spotify/card.js';
import { colorSwatch, resultColumn, sizeRow, styleOption, switchRow } from './components.js';
import { renderLayout } from './layout.js';
import { spotifyScript } from './scripts/spotify.js';

/** Which styles each optional setting applies to (matched against the form's data-mode). */
const WITH_COVER = 'card compact vinyl cassette blur polaroid equalizer island player';
const WITH_PROGRESS = 'card vinyl blur terminal lcd equalizer player';

/** GET /now-playing — the Spotify card builder. */
export function renderSpotifyPage(locale: Locale, t: Translate, owner: string): string {
  const e = (key: Parameters<Translate>[0]) => escapeXml(t(key));

  const styleOptions = CARD_STYLES.map((style) =>
    styleOption('style', style, t(`spotify.style.${style}`), `/spotify?style=${style}`, style === 'card')
  ).join('');

  const modeOption = (mode: keyof typeof CARD_PRESETS, checked: boolean) => {
    const preset = CARD_PRESETS[mode];
    return `
                <label><input type="radio" name="mode" value="${mode}" data-bg="${preset.background}" data-color="${preset.foreground}"${checked ? ' checked' : ''}><span>${e(mode === 'dark' ? 'result.dark' : 'result.light')}</span></label>`;
  };

  const body = `
    <section class="hero">
      <h1>${e('spotify.title')}</h1>
      <p>${e('spotify.text')}</p>
    </section>

    <div class="workspace">${resultColumn({
      t,
      handle: owner,
      previewSrc: '/spotify',
      previewAlt: 'Now playing on Spotify',
      readmeText: t('spotify.readme'),
    })}

      <form id="builder" class="builder" data-mode="card" autocomplete="off">
        <section class="section" aria-labelledby="look-title">
          <h2 id="look-title" class="section__title">${e('form.appearance')}</h2>
          <div class="panel">
            <fieldset class="row row--stacked">
              <legend class="row__label">${e('form.style')}</legend>
              <div class="styles styles--wide">${styleOptions}
              </div>
            </fieldset>

            <fieldset class="row">
              <legend class="row__label">${e('spotify.mode')}<small>${e('spotify.modeHint')}</small></legend>
              <div class="segmented">${modeOption('dark', true)}${modeOption('light', false)}
              </div>
            </fieldset>
            <fieldset class="row">
              <legend class="row__label">${e('form.colors')}</legend>
              <div class="swatches">${colorSwatch('bg', t('form.fill'), CARD_PRESETS.dark.background)}${colorSwatch('color', t('form.text'), CARD_PRESETS.dark.foreground)}${colorSwatch('accent', t('spotify.accent'), SPOTIFY_GREEN)}
              </div>
            </fieldset>
            <fieldset class="row" data-for="mascot">
              <legend class="row__label">${e('spotify.mascot')}<small>${e('spotify.mascotHint')}</small></legend>
              <div class="segmented">${MASCOTS.map(
                (mascot) => `
                <label><input type="radio" name="mascot" value="${mascot}"${mascot === 'dragon' ? ' checked' : ''}><span>${e(`spotify.mascot.${mascot}`)}</span></label>`
              ).join('')}
              </div>
            </fieldset>
${switchRow('cover', t('spotify.cover'), t('spotify.coverHint'), true, WITH_COVER)}${switchRow('progress', t('spotify.progress'), t('spotify.progressHint'), true, WITH_PROGRESS)}${sizeRow(t)}
          </div>
        </section>

        <section class="section" aria-labelledby="about-title">
          <h2 id="about-title" class="section__title">${e('spotify.how')}</h2>
          <div class="panel note">
            <p>${e('spotify.how1')}</p>
            <p>${e('spotify.how2')}</p>
          </div>
        </section>
      </form>
    </div>
`;

  return renderLayout({
    locale,
    t,
    page: 'spotify',
    title: t('meta.spotify.title'),
    description: t('meta.spotify.description'),
    body,
    script: spotifyScript,
  });
}
