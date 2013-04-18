var orangeproton = orangeproton || {};

$(document).ready(function () {
    var $code = $('#code-name');
    var $lang = $('#lang');

    /**
     * Adjusts the width of the mindmap div
     */
    resizeMindmap();

    /**
     * load the admin interface
     */
    orangeproton.admin.loadPanel();
    $("#hide-panels").html(I18n.t("show")).rotate(-90);

    /**
     * add event handler for code searches
     */
    $code.enterHandler(function () {
        $(document).trigger('paramChange', [null, null, true]);
    });

    /**
     * add event handler for location change
     */
    $(document).on('locationChange', function () {
        var pos = orangeproton.location.getLocation();
        orangeproton.location.reverseGeoCode(pos.lat, pos.lng, function (lat, lng, address) {
            $('.location').html('<p class="icon-globe globe"></p>' + address.ellipses(100));
        });
    });

    /**
     * re-do layout when window size changes. Wait 150ms before firing.
     */
    function resize() {
        resizeMindmap();
        $(document).trigger('paramChange', [null, null, true]);
    }
    $(window).resize( $.debounce( 250, resize ) );

    /**
     * add event handler for starting a search
     */
    $(document).on('paramChange', function (e, code, lang, force) {
        var $code = $('#code-name');
        var $lang = $('#lang');

        code = code || $code.val();
        lang = lang || $lang.val();

        code = code.toUpperCase();

        $code.val(code);
        $lang.val(lang);

        orangeproton.language.setLocale(lang);
        if (code != '') {
            History.pushState({code: code, lang: lang}, "OrangeProton", "?code=" + code + "&lang=" + lang);
            if (force) History.Adapter.trigger(window, 'statechange');
        }
    });

    /**
     * add event handler for panel toggling
     */
    $('.title').click(function () {
        $(this).next().toggle('blind');
    });

    $("#hide-panels").click(function () {
        togglePanels();
    });

    /**
     * add click handler for search button
     */
    $("#search-button").on('click', null, function () {
        $(document).trigger('paramChange', [null, null, true]);
    });

    /**
     * add click handler for location display
     */
    $('.location').on('click', null, function () {
        orangeproton.location.showMap();
    });

    /**
     * add event handler for language change on UI element
     */
    $lang.change(function () {
        $(document).trigger('paramChange');
    });

    orangeproton.location.startGeoLocation();

    /**
     * Overwrite window.alert() with a fancier, styled and customizable message box
     */
    function betterAlert(msg) {
        function closeBox() {
            jQuery.fancybox.close();
        }

        orangeproton.generic.messageBox('Info', msg, ['Ok'], [closeBox], 0);
    }

    window.alert = betterAlert;

    $code.focus();

    /**
     * Watch for changes in the history and start new search
     */
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        var code = State.data.code; // other values: State.title (OrangeProton) and  State.url (http://host/?code=B21&lang=de)
        var lang = State.data.lang;

        if (code !== undefined && code !== '') {
            $('#code-name').val(code);
            $('#lang').val(lang);
            var $mm = $('#mindmap');
            $mm.megamind('cleanUp');
            $mm.spin(orangeproton.options.libraries.spinner);
            mindmapper.getICD(code, lang);
        }
    });

    var codeParam = orangeproton.generic.getUrlVars()["code"];

    if (codeParam !== undefined && codeParam !== '') {
        var code = codeParam.toUpperCase();
        var lang = orangeproton.generic.getUrlVars()["lang"] || "de";
        $(document).trigger('paramChange', [code, lang]);
    }

    // set the locale and load translations
    orangeproton.language.setLocale($lang.val());

    /**
     * add svg class to elements with SVG components
     */
    if (orangeproton.generic.supportsSVG()) {
        $('.hide-arrow').addClass('svg');
    }
});
/**
 * Handle the main user flow
 * @class MindMapper
 */
var mindmapper = {

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
    getICD: function (input, lang) {
        var params = '?code={0}&lang={1}'.format(input, lang);

        jQuery.ajax({
            url: '/api/v1/fields/get' + params + '&count=4',
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
                    alert(message);
                    return;
                }

                var data = response.result.data; // text is already parsed by JQuery

                var name = data.text;
                var container = $mm.megamind();      //initialize
                var rootNode = "<div class='root'><p>{0}</br>{1}</p></div>".format(input, name);
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
                    synonyms = mindmapper.generateBubbles(data.synonyms, options.max_syn, 'syn');
                }
                var c = $mm.megamind('addCanvas', [megamind.presets().bottomRight]);
                c.addNodes(synonyms);

                var superclasses = [];
                if (data.superclass) {
                    var patternNoDash = /^(.[0-9]{2}(\.[0-9]{1,2})?)</gi;  //matches a single ICD before a HTML-tag start
                    var content = '{0}<br />{1}'.format(data.superclass, data.superclass_text || '');
                    superclasses = mindmapper.generateBubbles([content], 1, 'super', patternNoDash);
                }
                var c = $mm.megamind('addCanvas', [megamind.presets().topRight]);
                c.addNodes(superclasses);

                var subclasses = mindmapper.generateBubbles(data.subclasses, options.max_sub, 'sub', /(.*)/gi);
                var c = $mm.megamind('addCanvas', [megamind.presets().right]);
                c.addNodes(subclasses);

                var drgs = mindmapper.generateBubbles(data.drgs, orangeproton.options.display.max_drgs, 'drg');
                var c = $mm.megamind('addCanvas', [megamind.presets().top]);
                c.addNodes(drgs);

                var icdPattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/gi;
                var exclusiva = mindmapper.generateBubbles(data.exclusiva, options.max_exclusiva, 'exclusiva', icdPattern);

                var inclusiva = mindmapper.generateBubbles(data.inclusiva, options.max_inclusiva, 'inclusiva', icdPattern);
                var c = $mm.megamind('addCanvas', [megamind.presets().bottom]);
                c.addNodes(exclusiva.concat(inclusiva));

                var s = [];
                var fields = response.result.fields;
                for (var i = 0; i < Math.min(options.max_fields, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var newdiv = $('<div class="field">' + f + ':' + n + '</i>' +
                        '<div class="relatedness-container">' +
                        '<div class="relatedness-display" style="width:' + r * 100 + '%;" title=" Relevanz ' + Math.round(r * 100) + '%"></div>' +
                        '</div>' +
                        '</div>');
                    newdiv.on('click', { field: f }, function (e) {
                        $(this).spin(orangeproton.options.libraries.spinner);
                        var lat = orangeproton.location.getLocation().lat;
                        var lng = orangeproton.location.getLocation().lng;
                        orangeproton.doctor.getDoctors(e.data.field, lang, lat, lng);
                    });
                    s.push(newdiv);
                }

                var c = $mm.megamind('addCanvas', [megamind.presets().topLeft, megamind.presets().left, megamind.presets().bottomLeft]);
                c.addNodes(s);
            },

            error: mindmapper.handleApiError,

            complete: mindmapper.hideSpinner
        });
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
            alert(message);
        } catch (e) {
            if (error && error != '') alert(error);
        }
    },

    /**
     * hides all running spinners if there are any
     */
    hideSpinner: function () {
        $('.spinner').remove();
    },

    /**
     * Generate HTML elements for bubbles. Pass pattern to make bubble clickable. If you don't supply
     * a click handler, the default click handler will be used, which starts a new search for the
     * first match of the RegExp.
     * @param {String[]} contents Text content for the bubbles
     * @param {Number} limit Max number of bubbles
     * @param {String} className class to add
     * @param {Object} [pattern] Regex pattern. If it matches, an onClick handler is added
     * @param {Object} [data] Additional data to pass to the click handler
     * @param {Function} [click] Click handler method. use data to access (data) and match to get the match of the RegEx
     * @param {Object} [click.data] the data passed to #generateBubbles
     * @param {Array} [click.match] the result of `content.match(pattern)`
     * @returns {Array} of the elements
     */
    generateBubbles: function (contents, limit, className, pattern, data, click) {
        var bubbles = [];
        if (!contents) return bubbles;
        contents = contents.slice(0, limit); // set collection size limit
        $.each(contents, function (index, text) {
            var $element = $('<div></div>')
                .addClass(className)
                .html(text.replace(/(.*) \{(.*)\}/i, '$2<br />$1'));  // make asdf {b} become asdf<br />b
            if (pattern) {
                var result = text.match(pattern);
                if (result) {
                    if (click) {        //onclick handler was supplied
                        $element.on('click', {data: data, match: result}, function (e) {
                            console.log('click1');
                            click(e.data.data, e.data.match);
                        });
                    } else {            //inject the default click handler
                        $element.on('click', {match: result}, function (e) {
                            var code = decodeURI(e.data.match[0]);
                            code = code.replace('<', '').replace('{', '').replace('}', ''); //bad fix for a bad regex
                            $(document).trigger('paramChange', [code, null]);
                            $('#mindmap').megamind('setRoot', this, true);
                        });
                    }
                    $element.addClass('clickable');
                } else {
                    //regex does not match
                }
            }
            bubbles.push($element);
        });
        return bubbles;
    }
};

//Show/Hides the panels
var hidden = true;
function togglePanels() {

    var amount = !hidden ? "-69" : "171";
    var width = !hidden ? "0" : "250";
    var panel = $("#hide-panels");

    $("#panels").animate({"width": width + "px"}, "fast");
    panel.animate({"right": amount + "px"}, "fast", function () {
        resizeMindmap();
        $(document).trigger('paramChange', [null, null, true]);
    });


    panel.html(hidePanelText());
    panel.rotate(-90);
    hidden = !hidden;
}

function hidePanelText() {
    return hidden ? I18n.t("show") : I18n.t("hide");
}

function resizeMindmap() {
    var otherWidth = hidden ? 20 : $("#panels").outerWidth();
    var mindmap = $("#mindmap");
    mindmap.width($(window).width() - otherWidth);
    mindmap.outerHeight($(window).height()-($("#search-bar").outerHeight()+50));
}