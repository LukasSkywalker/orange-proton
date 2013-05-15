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
        this.updateToolTips();
    },

    updateToolTips: function(){
        //Tooltips
        $('#code-name').attr('title', I18n.t('enter_icd_or_chop'));
        $('#catalogSelectBoxIt').attr('title', I18n.t('choose_catalog'));
        $('#modeSelectBoxIt').attr('title', I18n.t('choose_mode'));
        $('#langSelectBoxIt').attr('title', I18n.t('choose_language'));
        $('#hide-panels').attr('title', I18n.t('shows_help'));
        $('#location-container').attr('title', I18n.t('change_loc'));

        $('#search-bar [title]').tipsy(orangeproton.options.libraries.tipsy);

        $('#hide-panels').tipsy({
            trigger: 'hover',
            gravity: 'e',
            delayIn: '300',
            delayOut: '100',
            fade: 'true',
            opacity: 1
        });
    }
};
