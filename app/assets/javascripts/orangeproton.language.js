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
    $("#hide-panels").html(orangeproton.language.getPanelTogglerText());
  },

  /**
   * load the legend in the right translation
   */
  updateUiLanguage: function() {
    $('#legend-text').empty();

    var identifiers = ['syn', 'field', 'super', 'sub', 'drg', 'exclusiva', 'inclusiva'];

    $.each(identifiers, function (index, name) {
      $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend-text');
    });

    $('#legend-title').html('<p>' + I18n.t('legend') + '</p>');

    $('#hide-panels').html(orangeproton.language.getPanelTogglerText());
  },

  /**
   * get the text to display on the toggler based on the current state
   * @returns {String} the label
   */
  getPanelTogglerText: function() {
    var panelHidden = mindmapper.panelHidden();
    return panelHidden ? I18n.t("show") : I18n.t("hide");
  }
};