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
    setLocale: function (locale) {
        I18n.locale = locale || "de";
        this.updateUiLanguage();
    },

    /**
     * load the legend in the right translation
     */
    updateUiLanguage: function () {
        $('#legend-text').empty();

        var identifiers = ['syn', 'field', 'super', 'sub', 'drg', 'exclusiva', 'inclusiva'];

        $.each(identifiers, function (index, name) {
            $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend-text');
        });

        $('#legend-title').html('<p>' + I18n.t('legend') + '</p>');

        $('#info-title').html('<p>' + I18n.t('info_title') + '</p>');

        $('#info-text').html('<p>' + I18n.t('info_text') + '</p>');

        $('#loc').html(I18n.t('location') + ': ');

        //Tooltips
        // TODO Translate this stuff
        $('#code-name').attr('title', 'Geben Sie hier einen ICD- oder CHOP- Code ein');
        $('.catalog-arrow').attr('title', 'Wählen Sie einen Katalog');
        $('.mode-arrow').attr('title', 'Wählen Sie den Modus');
        $('.lang-arrow').attr('title', 'Wählen Sie die Sprache');
        $('#location-container').attr('title', 'Klicken Sie hier um ihren Standort zu ändern');

        $('#search-bar [title]').tipsy({
            trigger: 'hover',
            gravity: 'n',
            delayIn: '300',
            delayOut: '100',
            fade: 'true'
        });
    }
};