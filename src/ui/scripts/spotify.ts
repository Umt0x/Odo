/** Browser script for the Spotify card builder; uses window.odoBuilder from shared.ts. */
export const spotifyScript = String.raw`
(function () {
  'use strict';

  var form = document.getElementById('builder');
  var fields = form.elements;
  var builder;

  // Light/Dark set both colors at once and become the new defaults,
  // so the URL only carries colors that differ from the chosen mode.
  function applyMode() {
    var option = form.querySelector('input[name="mode"]:checked');
    ['bg', 'color'].forEach(function (name) {
      fields[name].defaultValue = option.dataset[name];
      fields[name].value = option.dataset[name];
    });
  }

  function cardParams() {
    var params = new URLSearchParams();
    var style = fields.style.value;
    if (style !== 'card') params.set('style', style);
    if (fields.mode.value === 'light') params.set('mode', 'light');
    builder.setColor(params, 'bg', fields.bg);
    builder.setColor(params, 'color', fields.color);
    builder.setColor(params, 'accent', fields.accent);
    if (!fields.cover.checked) params.set('cover', '0');
    if (!fields.progress.checked) params.set('progress', '0');
    builder.setScale(params);
    return params;
  }

  function cardUrl(params) {
    var query = params.toString();
    return location.origin + '/spotify' + (query ? '?' + query : '');
  }

  builder = window.odoBuilder({
    alt: 'Now playing on Spotify',
    urls: function () {
      var url = cardUrl(cardParams());
      return { embed: url, preview: url, link: location.origin + '/spotify/open' };
    },
    onInput: function (event) {
      if (event.target.name === 'mode') applyMode();
    },
    afterRender: function () {
      form.dataset.mode = fields.style.value;
    }
  });
})();
`;
