var orangeproton = orangeproton || {};

$(document).ready(function () {
    var $codeInput = $('#code-name');
    var $lang = $('#lang');
    var $catalog = $('#catalog');
    var $mode = $('#mode');
    var $searchButton = $('#search-button');
    var $panelToggler = $('#hide-panels');
    var $searchBar = $('#search-bar');

    orangeproton.generic.injectConsoleLog();

    orangeproton.trail.clear();
    orangeproton.trail.push('root', orangeproton.generic.getUrlVars()["code"]);

    /* TOP-BAR */
    // start search on enter key press
    $searchBar.enterHandler(function () {
        $(document).trigger('paramChange', [null, null, true]);
        orangeproton.trail.clear();
        orangeproton.trail.push('root', $codeInput.val())
    });
    // start search on button click
    $searchButton.on('click', null, function () {
        $(document).trigger('paramChange', [null, null, true]);
        orangeproton.trail.clear();
        orangeproton.trail.push('root', $codeInput.val())
    });
    // focus search field
    $codeInput.focus();

    // add click handler for location display
    $('#location-container').on('click', null, function () {
      orangeproton.location.showMap();
    });

    I18n.defaultLocale = 'de';
    I18n.fallbacks = true;

    // add event handler for language change on UI element
    $lang.change(function () {
      $(document).trigger('paramChange');
    });

    // add event handler for catlog change
    $catalog.change(function () {
        var catalog = $(this).val();
        var prevCatalog = mindmapper.prevCatalog;
        if( mindmapper.prevCatalog ) {
            if( prevCatalog.indexOf('icd') > -1 && catalog.indexOf('icd') > -1 ) {
                $(document).trigger('paramChange');
            }
            if( prevCatalog.indexOf('chop') > -1 && catalog.indexOf('chop') > -1 ) {
                $(document).trigger('paramChange');
            }
        } else {
            $(document).trigger('paramChange');
        }
    });

    // add event handler for mode change on UI element
    $mode.change(function () {
        $(document).trigger('paramChange');
    });

    // add event handler for location change
    $(document).on('locationChange', function () {
        var pos = orangeproton.location.getLocation();
        orangeproton.location.reverseGeoCode(pos.lat, pos.lng, function (lat, lng, address) {
            $('.location').html('<p class="icon-globe globe"></p><p id="loc">'+ I18n.t('location') +': </p><p>' + address.ellipses(100) + '</p>');
        });
    });

    $searchBar.hoverIntent(function(){
        clearHighlight();
    }, null);

    //re-do layout when window size changes. Wait 150ms before firing.
    function resize() {
        orangeproton.mindmap.resizeMindmap();
        $('#mindmap').megamind('redraw');
    }
    $(window).resize( $.debounce( 250, resize ) );

    // add event handler for param changes (starts a search)
    $(document).on('paramChange', function (e, code, lang, force, mode, catalog) {
        $.notify.close();

        var $code    = $('#code-name');
        var $lang    = $('#lang');
        var $catalog = $('#catalog');
        var $mode    = $('#mode');

        code = code || $code.val();
        catalog = catalog || $catalog.val();
        lang = lang || $lang.val();
        mode = mode || $mode.val();
        code = $.trim(code.toUpperCase());

        $code.val(code);
        $lang.val(lang);
        $catalog.val(catalog);
        $mode.val(mode);

        // Change language if requested
        orangeproton.language.setLocale(lang);


        if (code != '') {
            // save state in history, including all parameters
            History.pushState(
                    {code: code, lang: lang, catalog: catalog, mode: mode},
                    "OrangeProton",
                    "?code=" + code + "&lang=" + lang + "&mode=" + mode + "&catalog=" + catalog
                    );
            // when no parameter changed, the statechange event won't be fired after calling pushState(). This is why we allow to 'force' a statechange, for example
            // when the user presses the search button again. To prevent firing manually when pushState() already fired, we check whether parameters changed
            // and if they didn't we fire.
            if (force && mindmapper.prevCode === code && mindmapper.prevLang === lang && mindmapper.prevMode === mode && mindmapper.prevCatalog === catalog)
                History.Adapter.trigger(window, 'statechange');
            mindmapper.prevCode = code;
            mindmapper.prevLang = lang;
            mindmapper.prevCatalog = catalog;
            mindmapper.prevMode = mode;
        }
    });


    // Adjust the size of the mindmap div
    orangeproton.mindmap.resizeMindmap();

    /* ADMIN-PANELS */
    // load the panel
    orangeproton.admin.loadPanel();

    // click handler for hiding the whole right panel
    $panelToggler.click(function () {
        togglePanels();
    });

    // start geolocation
    orangeproton.location.startGeoLocation();

    // Watch for changes in the history and start new search
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        var code = State.data.code; // other values: State.title (OrangeProton) and  State.url (http://host/?code=B21&lang=de&mode=sd)
        var lang = State.data.lang;
        var catalog = State.data.catalog;
        var mode = State.data.mode;

        // update the UI elements and start search when back-button is used or statechange is fired manually
        if (code !== undefined && code !== '') {
            $('#code-name').val(code);
            $('#lang').val(lang);
            $('#mode').val(mode);
            $('#catalog').val(catalog);
            var $mm = $('#mindmap');
            $mm.megamind('cleanUp');
            $mm.spin(orangeproton.options.libraries.spinner);
            mindmapper.getICD(code, lang, mode, catalog);
        }
    });

    var codeParam = orangeproton.generic.getUrlVars()["code"];

    if (codeParam !== undefined && codeParam !== '') {
        var code = $.trim(codeParam.toUpperCase());
        var lang = orangeproton.generic.getUrlVars()["lang"] || "de";
        var catalog = orangeproton.generic.getUrlVars()["catalog"] || "icd_2012_ch";
        var mode = orangeproton.generic.getUrlVars()["mode"] || "sd";
        $(document).trigger('paramChange', [code, lang, false, mode, catalog]);
    }

    // set the locale and load translations
    orangeproton.language.setLocale($lang.val());

    //add svg class to elements where we have an SVG-image
    if (orangeproton.generic.supportsSVG()) {
        $('.hide-arrow').addClass('svg');
        $('.mode-arrow').addClass('svg');
    }
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
     */
    getICD: function (input, lang, mode, catalog) {
        var params = '?code={0}&lang={1}&catalog={2}'.format(input, lang, catalog)
        var count = orangeproton.options.display.max_fields;
        if( mindmapper.requestQueue.length > 0 ) {
            for(var i = 0; i < mindmapper.requestQueue.length; i++) {
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
                var $mm = $('#mindmap');
                var options = orangeproton.options.display;
                $mm.megamind('cleanUp');

                var status = response.status;
                if (status === 'error') {
                    var message = response.message;
                    $.notify.error(message, { occupySpace : true ,close : true});
                    return;
                }

                var data = response.result.data; // text is already parsed by JQuery

                var name = data.text;
                var container = $mm.megamind();      //initialize
                name = name.replace(/\{(.*?)\}/gi, '{<a href="#" onclick="event.preventDefault(); $(document).trigger(\'paramChange\', [\'$1\']);">$1</a>}');
                var rootNode = $('<div class="root"><p>{0}</br>{1}</p></div>'.format(input, name)).hoverIntent(function(){
                    clearHighlight();
                }, null);

                //Add handler to clear Highlight

                var root = $mm.megamind('setRoot', rootNode);

                var synonyms = [];
                if (orangeproton.options.display.as_list) {
                    var syn = data.synonyms.slice(0, options.max_syn);
                    var newdiv = $.map(syn,function (el) {
                        return '<li>{0}</li>'.format(el);
                    }).join('');

                    if (newdiv != '')
                        synonyms.push($('<div class="syn"><ul>{0}</ul></div>'.format(newdiv)));
                }
                else {
                    synonyms = orangeproton.mindmap.generateBubbles(data.synonyms, options.max_syn, 'syn');
                }
                var c = $mm.megamind('addCanvas', ['bottomRight'], 'syn');
                c.addNodes(synonyms);

                var superclasses = [];
                if (data.superclass) {
                    var patternNoDash = /^(.[0-9]{2}(\.[0-9]{1,2})?)</gi;  //matches a single ICD before a HTML-tag start
                    var content = '{0}<br />{1}'.format(data.superclass, data.superclass_text || '');
                    superclasses = orangeproton.mindmap.generateBubbles([content], 1, 'super', patternNoDash);
                }
                var c = $mm.megamind('addCanvas', ['topRight'], 'super');
                c.addNodes(superclasses);

                var subclasses = orangeproton.mindmap.generateBubbles(data.subclasses, options.max_sub, 'sub', /(.*)/gi);
                var c = $mm.megamind('addCanvas', ['right'], 'sub', {shuffle: false});
                c.addNodes(subclasses);

                //mode setting
                if(mode == 'ad'){
                    var drgs = orangeproton.mindmap.generateBubbles(data.drgs, orangeproton.options.display.max_drgs, 'drg');
                    var c = $mm.megamind('addCanvas', ['top'], 'drg', {shuffle: false});
                    c.addNodes(drgs);

                    var exc = orangeproton.mindmap.preprocessNodes(data.exclusiva);
                    var icdPattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/gi;
                    var exclusiva = orangeproton.mindmap.generateBubbles(exc, 10, 'exclusiva', icdPattern);

                    var inc = orangeproton.mindmap.preprocessNodes(data.inclusiva);
                    var inclusiva = orangeproton.mindmap.generateBubbles(inc, options.max_inclusiva, 'inclusiva', icdPattern);
                    var c = $mm.megamind('addCanvas', ['bottom'], 'inclusiva-exclusiva');
                    c.addNodes(exclusiva.concat(inclusiva));
                }

                var s = [];
                var fields = response.result.fields;
                fields.sortBy('relatedness');
                fields.reverse();
                for (var i = 0; i < Math.min(options.max_fields, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var newdiv = $('<div class="field clickable"><div class="content">' + f + ':' + n +
                        '<div class="relatedness-container">' +
                        '<div class="relatedness-display" style="width:' + r * 100 + '%;" title=" Relevanz ' + Math.round(r * 100) + '%"></div>' +
                        '</div></div>' +
                        '<p class="icon-user-md"></p>' +
                        '</div>');
                    newdiv.on('click', { field: f }, function (e) {
                        $(this).spin(orangeproton.options.libraries.spinner);
                        var lat = orangeproton.location.getLocation().lat;
                        var lng = orangeproton.location.getLocation().lng;
                        orangeproton.doctor.getDoctors(e.data.field, lang, lat, lng);
                    });
                    s.push(newdiv);

                    //add hover event to every field node
                    $(newdiv).hoverIntent(function (){
                        toggleHighlightContainer('field');
                    },null);
                }


                var c = $mm.megamind('addCanvas', ['topLeft', 'left', 'bottomLeft'], 'field', {shuffle: false});
                c.addNodes(s);
                mindmapper.hideSpinner();
                $('.syn.node').hoverIntent(function (){
                    toggleHighlightContainer('syn');
                }, null);

                $(".icon-user-md").each(function(){
                      $(this).css({"line-height": $(this).parent().height()+'px'});
                });

                var $trail = $('#bread-crumbs');

                $trail.html(orangeproton.trail.getList());
                $trail.xBreadcrumbs({showSpeed: 'fast'});

				if(response.result.is_fallback){
                    $.notify.alert("Fallback language", { occupySpace : true ,close : true, autoClose : 3000}); //TODO I18n this shit
                }

            },

            error: mindmapper.handleApiError,

            complete: function(jqXhr) {
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
            $.notify.error(message, { occupySpace : true ,close : true});
        } catch (e) {
            if (error && error != '' && error != 'abort') $.notify.error(error, { occupySpace : true ,close : true});;
        }
        if( error != 'abort')
            mindmapper.hideSpinner();
    },

    /**
     * hides all running spinners if there are any
     */
    hideSpinner: function () {
        $('.spinner').remove();
    },

    /**
     * check if the right panels are hidden
     * @returns {Boolean} whether they are hidden
     */
    panelHidden: function () {
        var hidden = $('#panels').data('hidden');
        if( hidden !== undefined ) return hidden;
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

    if(panelHidden) {
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
function toggleHighlightContainer(className){
    if(last!==className){
        clearHighlight();
        var $container = $('.container.' + className);
        var $text = $container.find('p:first');
        var $front =$('.front-container.' + className);
        $container.clearQueue().toggleClass('active', 400);

        last = className;
    }

}

function clearHighlight(){
    $('.container').removeClass('active', 400);
    last = undefined;
}
