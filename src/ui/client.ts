/**
 * Builder logic for the home page, inlined as a classic script.
 * Plain ES5-style JavaScript inside String.raw: no template literals or `${}`
 * here, so nothing gets interpolated or unescaped on the server side.
 */
export const clientScript = String.raw`
(function () {
  'use strict';

  var form = document.getElementById('builder');
  var fields = form.elements;
  var stageImage = document.getElementById('stage-badge');
  var stageHandle = document.getElementById('stage-handle');
  var code = document.getElementById('embed-code');
  var copyButton = document.getElementById('copy');
  var scaleOutput = document.getElementById('scale-out');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-format]'));
  var format = 'markdown';
  var timer;

  function handle() {
    var input = fields.handle;
    var cleaned = input.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, input.maxLength).toLowerCase();
    return cleaned || form.dataset.defaultHandle;
  }

  // Only send a color when it differs from the server default, to keep URLs short.
  function setColor(params, key, input) {
    if (input.value.toLowerCase() !== input.defaultValue.toLowerCase()) {
      params.set(key, input.value.replace('#', ''));
    }
  }

  function selectedTheme() {
    return form.querySelector('input[name="theme"]:checked');
  }

  // Drawn themes have their own default colors; show them in the swatches and
  // treat them as the defaults, so untouched colors stay out of the URL.
  var flatDefaults = { bg: fields.bg.defaultValue, color: fields.color.defaultValue };

  function resetColors() {
    var option = selectedTheme();
    var glyph = option.dataset.kind === 'glyph';
    ['bg', 'color'].forEach(function (name) {
      var value = glyph ? option.dataset[name] : flatDefaults[name];
      fields[name].defaultValue = value;
      fields[name].value = value;
    });
  }

  function badgeParams() {
    var params = new URLSearchParams();
    var theme = fields.theme.value;
    var kind = selectedTheme().dataset.kind;

    if (kind === 'flat') {
      var icon = fields.icon.value.trim();
      if (icon) params.set('icon', icon);
      setColor(params, 'bg', fields.bg);
      setColor(params, 'color', fields.color);
      setColor(params, 'stroke', fields.stroke);
      if (fields.animation.value !== 'none') params.set('animation', fields.animation.value);
    } else {
      params.set('theme', theme);
      // The field is called "digits": form.elements.length is the number of controls.
      params.set('length', fields.digits.value);
      if (kind === 'glyph') {
        setColor(params, 'color', fields.color);
        setColor(params, 'bg', fields.bg);
      } else if (!fields.pixelated.checked) {
        params.set('pixelated', '0');
      }
    }

    var scale = parseFloat(fields.scale.value);
    if (scale !== 1) params.set('scale', String(scale));
    if (fields.num.value !== '') params.set('num', fields.num.value);
    return params;
  }

  function badgeUrl(params) {
    var query = params.toString();
    return location.origin + '/@' + handle() + (query ? '?' + query : '');
  }

  function snippet(url) {
    if (format === 'html') return '<img src="' + url.replace(/&/g, '&amp;') + '" alt="Visitor count">';
    if (format === 'url') return url;
    return '![Visitor count](' + url + ')';
  }

  function render() {
    var params = badgeParams();
    code.textContent = snippet(badgeUrl(params));

    // The preview must not count as a visit.
    params.set('render', 'true');
    stageImage.src = badgeUrl(params);
    stageHandle.textContent = '@' + handle();
    form.dataset.mode = selectedTheme().dataset.kind;
  }

  function syncOutputs() {
    scaleOutput.textContent = parseFloat(fields.scale.value).toFixed(1) + '×';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  form.addEventListener('input', function (event) {
    syncOutputs();
    var type = event.target.type;
    if (event.target.name === 'theme') resetColors();
    if (type === 'radio' || type === 'checkbox') {
      render();
    } else {
      clearTimeout(timer);
      timer = setTimeout(render, 200);
    }
  });

  form.addEventListener('click', function (event) {
    var button = event.target.closest('[data-step]');
    if (!button) return;
    var input = fields.digits;
    var next = (parseInt(input.value, 10) || 0) + Number(button.dataset.step);
    input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), next)));
    render();
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
    flash('Press Ctrl+C');
  }

  copyButton.addEventListener('click', function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code.textContent).then(function () {
        flash('Copied!');
      }, selectSnippet);
    } else {
      selectSnippet();
    }
  });

  syncOutputs();
  render();
})();
`;
