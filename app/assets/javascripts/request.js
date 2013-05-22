var orangeproton = orangeproton || {};

$(document).ready(function () {

    //A layout fix for IE8
    if ($.browser.name === 'msie' && $.browser.version === '8.0') {
        var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        style.type = 'text/css';
        style.styleSheet.cssText = ':before,:after{content:none !important';
        head.appendChild(style);
        setTimeout(function () {
            head.removeChild(style);
        }, 0);
    }


    var $codeInput = $('#code');
    var $lang = $('#lang');
    var $searchButton = $('#search-button');
    var $searchBar = $('#search-bar');

    $("select").selectBoxIt();

    resizeSearchBar();

    orangeproton.generic.injectConsoleLog();

    $(document).on('trailUpdated', function (e, trail) {
        $('#bread-crumbs').renderTrail(trail);
    });

    orangeproton.trail.clear();
    var urlVars = orangeproton.generic.getUrlVars(document.location.href);
    if (urlVars["code"])
        orangeproton.trail.push('root', urlVars["code"]);

    /* TOP-BAR */
    // start search on enter key press
    $searchBar.enterHandler(function () {
        startSearch();
    });

    // start search on button click
    $searchButton.on('click', null, function () {
        startSearch();
    });

     // Starts a new search.
     //Clears the breadcrumbs first.
    function startSearch(){
        orangeproton.trail.clear();
        orangeproton.trail.push('root', $codeInput.val().toUpperCase());
        $(document).trigger('paramChange', [null, null, true]);
    }

    // focus search field
    $codeInput.focus();

    // add click handler for location display
    $('#location-container').on('click', null, function () {
        orangeproton.location.showMap();
        $('#location-popup [title]').tipsy(orangeproton.options.libraries.tipsy);
    });

    //Sets the standard values of I18n
    I18n.defaultLocale = 'de';
    I18n.fallbacks = true;

    // add event handler for language change on UI element
    $("select#lang").change(function () {
        $(document).trigger('paramChange');
    });

    // add event handler for catlog change
    $("select#catalog").change(function () {
        var catalog = $(this).val();
        var prevCatalog = mindmapper.prevCatalog;
        if (mindmapper.prevCatalog) {
            if (prevCatalog.indexOf('icd') > -1 && catalog.indexOf('icd') > -1) {
                $(document).trigger('paramChange');
            }
            if (prevCatalog.indexOf('chop') > -1 && catalog.indexOf('chop') > -1) {
                $(document).trigger('paramChange');
            }
        } else {
            $(document).trigger('paramChange');
        }
    });

    // add event handler for mode change on UI element
    $("select#mode").change(function () {
        $(document).trigger('paramChange');
    });

    // add event handler for location change
    $(document).on('locationChange', function (e, lat, lng) {
        var pos = orangeproton.location.getLocation();
        lat = lat || pos.lat;
        lng = lng || pos.lng;
        orangeproton.location.reverseGeoCode(lat, lng, function (lat, lng, address) {
            $('.location').html('<p class="icon-globe globe"></p><p id="loc">' + I18n.t('location') + ': </p><p>' + address.ellipses(100) + '</p>');
        });
    });

    $(document).trigger('locationChange');

    //add the hover event for container highlighting
    $searchBar.hoverIntent(function () {
        clearHighlight();
    }, null);

    /* ADMIN-PANELS */
    // load the panel in development mode
    if (window.rails_env === 'development' || window.rails_env === 'development-remote') {
        orangeproton.admin.displayPanel();
        console.log("sdf");
        orangeproton.admin.loadPanel();
        var $panelToggler = $('#hide-panels');
        // click handler for hiding the whole right panel
        $panelToggler.click(function () {
            togglePanels();
        });
    }

    //re-do layout when window size changes. Wait 150ms before firing.
    function resize() {
        orangeproton.mindmap.resizeMindmap();
        $('#mindmap').megamind('redraw');
        resizeSearchBar();
    }

    $(window).resize($.debounce(250, resize));

    // add event handler for param changes (starts a search)
    $(document).on('paramChange', function (e, code, lang, force, mode, catalog) {
        $.notify.close();
        $(".tipsy").remove();

        var $code = $('#code');
        var $lang = $('#lang');
        var $catalog = $('#catalog');
        var $mode = $('#mode');

        code = code || $code.val();
        catalog = catalog || $catalog.val();
        lang = lang || $lang.val();
        mode = mode || $mode.val();
        code = $.trim(code.toUpperCase());

        $code.val(code);
        $lang.val(lang);
        $catalog.val(catalog);
        $mode.val(mode);

        //set the dropdown to show the selected values
        var $langSelect = $("#lang");
        $langSelect.find("option[value=" + lang + "]").attr('selected', 'selected');
        $langSelect.data("selectBox-selectBoxIt").refresh();

        $catalog.find("option[value=" + catalog + "]").attr('selected', 'selected');
        $catalog.data("selectBox-selectBoxIt").refresh();

        $mode.find("option[value=" + mode + "]").attr('selected', 'selected');
        $mode.data("selectBox-selectBoxIt").refresh();

        // Change language if requested
        orangeproton.language.setLocale(lang);

        if (code != '') {
            // save state in history, including all parameters
            History.pushState(
                {code: code, lang: lang, catalog: catalog, mode: mode, trail: orangeproton.trail.crumbs},
                "OrangeProton",
                "?code=" + code + "&lang=" + lang + "&mode=" + mode + "&catalog=" + catalog
            );
            // when no parameter changed, the statechange event won't be fired after calling pushState(). This is why we allow to 'force' a statechange, for example
            // when the user presses the search button again. To prevent firing manually when pushState() already fired, we check whether parameters changed
            // and if they didn't we fire.
            if (!mindmapper.prevCode || force && mindmapper.prevCode === code && mindmapper.prevLang === lang && mindmapper.prevMode === mode && mindmapper.prevCatalog === catalog)
                History.Adapter.trigger(window, 'statechange');

            mindmapper.prevCode = code;
            mindmapper.prevLang = lang;
            mindmapper.prevCatalog = catalog;
            mindmapper.prevMode = mode;
        }
    });

    //remove all tooltips when clicking anywhere
    $(document).on('click', function(){
       $('.tipsy').remove();
    });

    // Adjust the size of the mindmap div
    orangeproton.mindmap.resizeMindmap();

    // start geolocation
    orangeproton.location.startGeoLocation();

    // Watch for changes in the history and start new search
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        var code = State.data.code; // other values: State.title (OrangeProton) and  State.url (http://host/?code=B21&lang=de&mode=sd)
        var lang = State.data.lang;
        var catalog = State.data.catalog;
        var mode = State.data.mode;
        var trail = State.data.trail;

        // update the UI elements and start search when back-button is used or statechange is fired manually
        if (code !== undefined && code !== '') {
            $('#code').val(code);
            $('#lang').val(lang);
            $('#mode').val(mode);
            $('#catalog').val(catalog);
            var $mm = $('#mindmap');
            $mm.megamind('cleanUp');
            $mm.spin(orangeproton.options.libraries.spinner);
            orangeproton.trail.setTrail(trail);

            // If last crumb is not the same as displayed in the root node (back functionality) trim to
            // first occurence of the code in the crumb stack from behind
            /*if (!orangeproton.trail.isEmpty() && (orangeproton.trail.lastCode() !== code)) {
                orangeproton.trail.trimToNextOccurenceOf(code);
            }*/
            mindmapper.getICD(code, lang, mode, catalog);
        }
    });

    var url = window.location.href;
    var urlVars = orangeproton.generic.getUrlVars(url);
    var codeParam = urlVars["code"];

    if (codeParam !== undefined && codeParam !== '') {
        var code = $.trim(codeParam.toUpperCase());
        var lang = urlVars["lang"] || "de";
        var catalog = urlVars["catalog"] || "icd_2012_ch";
        var mode = urlVars["mode"] || "sd";
        $(document).trigger('paramChange', [code, lang, true, mode, catalog]);
    }

    // set the locale and load translations
    orangeproton.language.setLocale($lang.val());

    $(document).on('afterDraw', function(){
        $('.syn.node').jScrollPane(orangeproton.options.libraries.jScrollPane);
    });
});
/**
 * Handle the main user flow
 * @class MindMapper
 */
var mindmapper = {
    prevLang: null,
    prevCode: null,
    prevMode: null,

    requestQueue: [],

    /**
     * Performs the API request and displays the data in the mindmap
     * DO NOT USE THIS METHOD EXCEPT IN THE HISTORY WATCHER!
     * call `$(document).trigger('paramChange', [code, lang, force]` if you need to
     * start a new search. Set lat, lng to null to use UI values. Set force to true
     * to search even when code and lang did not change.
     * @method getICD
     * @param {String} input the search term
     * @param {String} lang the search language
     * @param {String} mode the selected display mdoe
     * @param {String} catalog the selected catalog
     */
    getICD: function (input, lang, mode, catalog) {
        var params = '?code={0}&lang={1}&catalog={2}'.format(input, lang, catalog);
        var count = orangeproton.options.display.max_fields;
        if (mindmapper.requestQueue.length > 0) {
            for (var i = 0; i < mindmapper.requestQueue.length; i++) {
                mindmapper.requestQueue[i].abort();
            }
        }
        mindmapper.requestQueue = [];
        var req = jQuery.ajax({
            url: op.apiBase + '/fields/get' + params + '&count=' + count,
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response) {
                var animatedNode = $('.centering');
                if (animatedNode.length > 0) {
                    console.log('node is moving, adding complete handler');
                    animatedNode.on('centerComplete', function () {
                        console.log('node movement complete, drawing');
                        orangeproton.mindmap.draw(response, input, mode);
                    });
                } else {
                    orangeproton.mindmap.draw(response, input, mode);
                }
            },

            error: mindmapper.handleApiError,

            complete: function (jqXhr) {
                mindmapper.requestQueue.removeElement(jqXhr);

            }
        });
        mindmapper.requestQueue.push(req);
    },

    /**
     * Handle an API error response from a failed .ajax call
     * @param {Object} xhr the XMLHttpRequest object
     * @param {Number} httpStatus the status code
     * @param {String} error an error message
     */
    handleApiError: function (xhr, httpStatus, error) {
        try {
            var message = jQuery.parseJSON(xhr.responseText).error;
            $.notify.error(message, { occupySpace: true, close: true});
        } catch (e) {
            if (error && error != '' && error != 'abort') $.notify.error(error, { occupySpace: true, close: true});
        }
        if (error != 'abort')
            mindmapper.hideSpinner();
    },

    /**
     * hides all running spinners if there are any
     */
    hideSpinner: function () {
        $('.spinner').remove();
    },

    /**
     * check if the right panel is hidden
     * @returns {Boolean} whether they are hidden
     */
    panelHidden: function () {
        var hidden = $('#panels').data('hidden');
        if (hidden !== undefined) return hidden;
        else return true;
    }
};

//Show/Hide the panels
function togglePanels() {
    var $panels = $('#panels');
    var $panelHider = $('#hide-panels');
    var panelHidden = mindmapper.panelHidden();

    function resizeMindmap() {
        orangeproton.mindmap.resizeMindmap();
        $('#mindmap').megamind('redraw');
    }

    if (panelHidden) {
        $panelHider.animate({'right': '+=200'}, 400);
        $('#panels-container').show(400, resizeMindmap);
    } else {
        $panelHider.animate({'right': '-=200'}, 400);
        $('#panels-container').hide(400, resizeMindmap);
    }
    $panels.data('hidden', !panelHidden);
}

//Highlight the hovered node type (with huge hack...)
var last;
function toggleHighlightContainer(className) {
    if (last !== className) {
        clearHighlight();
        var $container = $('.container.' + className);
        $container.clearQueue().toggleClass('active', 400);

        last = className;
    }

}

//Clear all the container highlights
function clearHighlight() {
    $('.container').removeClass('active', 400);
    last = undefined;
}

//Resize the width of the search bar to fit into 800px
function resizeSearchBar(){
    var searchBarWidth = $('#search-bar').width();
    var $loc = $('#location-container');
    if (searchBarWidth <= 1024) {
        var $code = $('#code');
        var $btn = $('#search-button');
        var $cat = $('.catalog-container');
        var $lang = $('.lang-container');
        var $mode =  $('.mode-container');

        var margins = parseInt($loc.css('margin-left')) + parseInt($code.css('margin-left'))
            + parseInt($btn.css('margin-left')) + parseInt($cat.css('margin-left'))
            + parseInt($lang.css('margin-left')) + parseInt($mode.css('margin-left'))
            + parseInt($loc.css('margin-right')) + parseInt($code.css('margin-right'))
            + parseInt($btn.css('margin-right')) + parseInt($cat.css('margin-right'))
            + parseInt($lang.css('margin-right')) + parseInt($mode.css('margin-right'));
        var width = searchBarWidth - 20 - (margins + $code.outerWidth() + $btn.outerWidth() + $cat.outerWidth() + $lang.outerWidth() + $mode.outerWidth()        );
        $loc.width(width);
    } else {
        $loc.width(380);
    }
}
