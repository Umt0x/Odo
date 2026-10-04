import type { Translate } from '../i18n/index.js';
import { escapeXml } from '../lib/text.js';

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/>' +
  '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

const FILE_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>' +
  '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>';

interface ResultOptions {
  t: Translate;
  handle: string;
  previewSrc: string;
  previewAlt: string;
  readmeText: string;
}

/**
 * The right-hand column of a builder: the badge inside a mock GitHub README
 * (with a light/dark switch) and the embed snippet. Wired up by the shared script.
 */
export function resultColumn({ t, handle, previewSrc, previewAlt, readmeText }: ResultOptions): string {
  return `
      <aside class="result" aria-label="${escapeXml(t('result.label'))}">
        <figure class="preview" data-surface="light">
          <div class="preview__head">
            <span class="preview__file">${FILE_ICON}<span><span id="stage-handle">${escapeXml(handle)}</span> / README.md</span></span>
            <div class="surface" role="group" aria-label="${escapeXml(t('result.background'))}">
              <button type="button" data-surface-option="light" aria-pressed="true">${escapeXml(t('result.light'))}</button>
              <button type="button" data-surface-option="dark" aria-pressed="false">${escapeXml(t('result.dark'))}</button>
            </div>
          </div>
          <div class="preview__body">
            <p class="readme__title">${escapeXml(t('result.hi'))} <span id="stage-name">${escapeXml(handle)}</span></p>
            <p class="readme__text">${escapeXml(readmeText)}</p>
            <img id="stage-badge" src="${escapeXml(previewSrc)}" alt="${escapeXml(previewAlt)}">
          </div>
          <figcaption class="preview__foot"><span class="dot" aria-hidden="true"></span>${escapeXml(t('result.live'))}</figcaption>
        </figure>

        <section class="section embed" aria-labelledby="embed-title">
          <div class="section__head">
            <h2 id="embed-title" class="section__title">${escapeXml(t('result.embed'))}</h2>
            <div class="tabs" role="group" aria-label="${escapeXml(t('result.format'))}">
              <button type="button" class="tab" data-format="markdown" aria-pressed="true">Markdown</button>
              <button type="button" class="tab" data-format="html" aria-pressed="false">HTML</button>
              <button type="button" class="tab" data-format="url" aria-pressed="false">URL</button>
            </div>
          </div>
          <div class="code">
            <pre><code id="embed-code"></code></pre>
            <button type="button" id="copy" class="copy" data-copied="${escapeXml(t('result.copied'))}" data-press="${escapeXml(t('result.pressCopy'))}">${COPY_ICON}<span>${escapeXml(t('result.copy'))}</span></button>
          </div>
        </section>
      </aside>`;
}

/** A card in a style picker; `extra` carries data attributes for the browser script. */
export function styleOption(name: string, value: string, label: string, thumbnail: string, checked: boolean, extra = ''): string {
  return `
              <label class="style">
                <input type="radio" name="${name}" value="${escapeXml(value)}"${extra}${checked ? ' checked' : ''}>
                <span class="style__thumb"><img src="${escapeXml(thumbnail)}" alt="" loading="lazy" decoding="async"></span>
                <span class="style__name">${escapeXml(label)}</span>
              </label>`;
}

export function colorSwatch(name: string, label: string, value: string, onlyFor?: string): string {
  return `
                <label class="swatch"${onlyFor ? ` data-for="${onlyFor}"` : ''}>
                  <input type="color" name="${name}" value="${value}" aria-label="${escapeXml(label)}">
                  <span>${escapeXml(label)}</span>
                </label>`;
}

export function switchRow(name: string, label: string, hint: string, checked: boolean, onlyFor?: string): string {
  return `
            <label class="row"${onlyFor ? ` data-for="${onlyFor}"` : ''}>
              <span class="row__label">${escapeXml(label)}<small>${escapeXml(hint)}</small></span>
              <span class="switch">
                <input type="checkbox" name="${name}"${checked ? ' checked' : ''}>
                <span class="switch__track" aria-hidden="true"></span>
              </span>
            </label>`;
}

export function sizeRow(t: Translate): string {
  return `
            <label class="row">
              <span class="row__label">${escapeXml(t('form.size'))}</span>
              <span class="range">
                <input name="scale" type="range" min="0.5" max="2" step="0.1" value="1">
                <output id="scale-out" class="mono">1.0×</output>
              </span>
            </label>`;
}
