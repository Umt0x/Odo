/**
 * Helpers every builder page uses, inlined as a classic script. Defines
 * `window.odoBuilder(options)`, which wires the form, the README preview, the
 * snippet tabs and the copy button, and re-renders on every change.
 *
 * options.urls()      -> { embed, preview, link?, handle? }  (required)
 * options.alt         -> alt text used in the snippets
 * options.onInput(e)  -> called before re-rendering on each input event
 * options.afterRender -> called after each render
 *
 * Plain ES5-style JavaScript inside String.raw: no template literals or `${}`
 * here, so nothing gets interpolated or unescaped on the server side.
 */
export const sharedScript = String.raw`
(function () {
  'use strict';

  // The footer's language picker submits as soon as a language is chosen.
  Array.prototype.forEach.call(document.querySelectorAll('[data-autosubmit]'), function (select) {
    select.addEventListener('change', function () {
      select.form.submit();
    });
  });

  window.odoBuilder = function (options) {
    var form = document.getElementById('builder');
    var fields = form.elements;
    var stageImage = document.getElementById('stage-badge');
    var stageHandle = document.getElementById('stage-handle');
    var stageName = document.getElementById('stage-name');
    var preview = document.querySelector('.preview');
    var surfaceButtons = Array.prototype.slice.call(document.querySelectorAll('[data-surface-option]'));
    var code = document.getElementById('embed-code');
    var copyButton = document.getElementById('copy');
    var scaleOutput = document.getElementById('scale-out');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-format]'));
    var format = 'markdown';
    var timer;

    function attr(value) {
      return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }

    function snippet(url, link) {
      var alt = options.alt || 'Badge';
      if (format === 'url') return url;
      if (format === 'html') {
        var img = '<img src="' + attr(url) + '" alt="' + alt + '">';
        return link ? '<a href="' + attr(link) + '">' + img + '</a>' : img;
      }
      var image = '![' + alt + '](' + url + ')';
      return link ? '[' + image + '](' + link + ')' : image;
    }

    function render() {
      var urls = options.urls();
      code.textContent = snippet(urls.embed, urls.link);
      stageImage.src = urls.preview;
      if (urls.handle) {
        stageHandle.textContent = urls.handle;
        stageName.textContent = urls.handle;
      }
      if (options.afterRender) options.afterRender();
      syncVisibility();
    }

    // Rows marked data-for="a b" only show while the form's mode is a or b.
    function syncVisibility() {
      var mode = form.dataset.mode;
      Array.prototype.forEach.call(form.querySelectorAll('[data-for]'), function (element) {
        element.hidden = element.dataset.for.split(' ').indexOf(mode) === -1;
      });
    }

    function syncScale() {
      if (scaleOutput) scaleOutput.textContent = parseFloat(fields.scale.value).toFixed(1) + '×';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    form.addEventListener('input', function (event) {
      syncScale();
      if (options.onInput) options.onInput(event);
      var type = event.target.type;
      if (type === 'radio' || type === 'checkbox') {
        render();
      } else {
        clearTimeout(timer);
        timer = setTimeout(render, 200);
      }
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        format = tab.dataset.format;
        tabs.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === tab));
        });
        render();
      });
    });

    // Only the text changes; the icon next to it stays.
    var copyLabel = copyButton.querySelector('span') || copyButton;
    var copyText = copyLabel.textContent;

    function flash(label) {
      copyLabel.textContent = label;
      copyButton.classList.add('is-done');
      setTimeout(function () {
        copyLabel.textContent = copyText;
        copyButton.classList.remove('is-done');
      }, 1600);
    }

    function selectSnippet() {
      var range = document.createRange();
      range.selectNodeContents(code);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      flash(copyButton.dataset.press || 'Press Ctrl+C');
    }

    copyButton.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code.textContent).then(function () {
          flash(copyButton.dataset.copied || 'Copied!');
        }, selectSnippet);
      } else {
        selectSnippet();
      }
    });

    // The preview mimics a GitHub README; let people check the badge on both of its backgrounds.
    function setSurface(name) {
      preview.dataset.surface = name;
      surfaceButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.surfaceOption === name));
      });
    }

    surfaceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setSurface(button.dataset.surfaceOption);
      });
    });

    setSurface(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    var api = {
      form: form,
      fields: fields,
      render: render,
      // Only send a color when it differs from its default, to keep URLs short.
      setColor: function (params, key, input) {
        if (input.value.toLowerCase() !== input.defaultValue.toLowerCase()) {
          params.set(key, input.value.replace('#', ''));
        }
      },
      setScale: function (params) {
        var scale = parseFloat(fields.scale.value);
        if (scale !== 1) params.set('scale', String(scale));
      }
    };

    syncScale();
    setTimeout(render);
    return api;
  };
})();
`;
