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


    updateUiLanguage: function () {
        $('#loc').html(I18n.t('location') + ': ');
        this.updateToolTips();
    },

    updateToolTips: function(){
        //Tooltips
        $('#code').attr('title', I18n.t('enter_icd_or_chop'));
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
