/** Browser script for the visitor counter builder; uses window.odoBuilder from shared.ts. */
export const counterScript = String.raw`
(function () {
  'use strict';

  var form = document.getElementById('builder');
  var fields = form.elements;

  function handle() {
    var input = fields.handle;
    var cleaned = input.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, input.maxLength).toLowerCase();
    return cleaned || form.dataset.defaultHandle;
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

  var builder;

  function badgeParams() {
    var params = new URLSearchParams();
    var theme = fields.theme.value;
    var kind = selectedTheme().dataset.kind;

    if (kind === 'flat') {
      var icon = fields.icon.value.trim();
      if (icon) params.set('icon', icon);
      builder.setColor(params, 'bg', fields.bg);
      builder.setColor(params, 'color', fields.color);
      builder.setColor(params, 'stroke', fields.stroke);
      if (fields.animation.value !== 'none') params.set('animation', fields.animation.value);
    } else {
      params.set('theme', theme);
      // The field is called "digits": form.elements.length is the number of controls.
      params.set('length', fields.digits.value);
      if (kind === 'glyph') {
        builder.setColor(params, 'color', fields.color);
        builder.setColor(params, 'bg', fields.bg);
      } else if (!fields.pixelated.checked) {
        params.set('pixelated', '0');
      }
    }

    builder.setScale(params);
    if (fields.num.value !== '') params.set('num', fields.num.value);
    return params;
  }

  function badgeUrl(params) {
    var query = params.toString();
    return location.origin + '/@' + handle() + (query ? '?' + query : '');
  }

  builder = window.odoBuilder({
    alt: 'Visitor count',
    urls: function () {
      var params = badgeParams();
      var embed = badgeUrl(params);
      // The preview must not count as a visit.
      params.set('render', 'true');
      return { embed: embed, preview: badgeUrl(params), handle: handle() };
    },
    onInput: function (event) {
      if (event.target.name === 'theme') resetColors();
    },
    afterRender: function () {
      form.dataset.mode = selectedTheme().dataset.kind;
    }
  });

  form.addEventListener('click', function (event) {
    var button = event.target.closest('[data-step]');
    if (!button) return;
    var input = fields.digits;
    var next = (parseInt(input.value, 10) || 0) + Number(button.dataset.step);
    input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), next)));
    builder.render();
  });
})();
`;
