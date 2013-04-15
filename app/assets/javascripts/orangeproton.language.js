/**
 * All language-related methods and requests
 * @class orangeproton.language
 */
var orangeproton = orangeproton || {};
orangeproton.language = {
  /**
   * Set the language and reload translatable UI-elements
   * @param {String} locale the new language
   */
  setLocale: function(locale) {
    I18n.locale = locale || "de";
    this.updateUiLanguage();
  },

  /**
   * load the legend in the right translation
   */
  updateUiLanguage: function() {
    $('#legend-text').empty();

    var identifiers = ['syn', 'cat', 'super', 'sub', 'drg', 'exclusiva', 'inclusiva'];

    $.each(identifiers, function (index, name) {
      $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend-text');
    });

    $('#legend-title').html('<p>' + I18n.t('legend') + '</p>');
  }
};