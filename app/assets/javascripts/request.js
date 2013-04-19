var orangeproton = orangeproton || {};

$(document).ready(function () {
    var $codeInput = $('#code-name');
    var $lang = $('#lang');
    var $searchButton = $('#search-button');
    var $panelToggler = $('#hide-panels');


    /* TOP-BAR */
    // start search on enter key press
    $codeInput.enterHandler(function () {
        $(document).trigger('paramChange', [null, null, true]);
    });
    // start search on button click
    $searchButton.on('click', null, function () {
        $(document).trigger('paramChange', [null, null, true]);
    });
    // focus search field
    $codeInput.focus();

    // add click handler for location display
    $('.location').on('click', null, function () {
      orangeproton.location.showMap();
    });

    // add event handler for language change on UI element
    $lang.change(function () {
      $(document).trigger('paramChange');
    });

    // add event handler for location change
    $(document).on('locationChange', function () {
        var pos = orangeproton.location.getLocation();
        orangeproton.location.reverseGeoCode(pos.lat, pos.lng, function (lat, lng, address) {
            $('.location').html('<p class="icon-globe globe"></p>' + address.ellipses(100));
        });
    });

    //re-do layout when window size changes. Wait 150ms before firing.
    function resize() {
        orangeproton.mindmap.resizeMindmap();
        $(document).trigger('paramChange', [null, null, true]);
    }
    $(window).resize( $.debounce( 250, resize ) );

    // add event handler for param changes (starts a search)
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


    // Adjust the size of the mindmap div
    orangeproton.mindmap.resizeMindmap();

    /* ADMIN-PANELS */
    // load the panel
    orangeproton.admin.loadPanel();
    $panelToggler.rotate(-90);

    // event handler for hiding the individual panels
    $('.title').click(function () {
        $(this).next().toggle('blind');
    });

    // click handler for hiding the whole right panel
    $panelToggler.click(function () {
        togglePanels();
    });

    // start geolocation
    orangeproton.location.startGeoLocation();

    orangeproton.generic.overwriteAlert();

    // Watch for changes in the history and start new search
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

    //add svg class to elements where we have an SVG-image
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
        var count = orangeproton.options.display.max_fields;
        jQuery.ajax({
            url: '/api/v1/fields/get' + params + '&count=' + count,
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
                    synonyms = orangeproton.mindmap.generateBubbles(data.synonyms, options.max_syn, 'syn');
                }
                var c = $mm.megamind('addCanvas', [megamind.presets().bottomRight]);
                c.addNodes(synonyms);

                var superclasses = [];
                if (data.superclass) {
                    var patternNoDash = /^(.[0-9]{2}(\.[0-9]{1,2})?)</gi;  //matches a single ICD before a HTML-tag start
                    var content = '{0}<br />{1}'.format(data.superclass, data.superclass_text || '');
                    superclasses = orangeproton.mindmap.generateBubbles([content], 1, 'super', patternNoDash);
                }
                var c = $mm.megamind('addCanvas', [megamind.presets().topRight]);
                c.addNodes(superclasses);

                var subclasses = orangeproton.mindmap.generateBubbles(data.subclasses, options.max_sub, 'sub', /(.*)/gi);
                var c = $mm.megamind('addCanvas', [megamind.presets().right]);
                c.addNodes(subclasses);

                var drgs = orangeproton.mindmap.generateBubbles(data.drgs, orangeproton.options.display.max_drgs, 'drg');
                var c = $mm.megamind('addCanvas', [megamind.presets().top]);
                c.addNodes(drgs);

                var exc = orangeproton.mindmap.preprocessNodes(data.exclusiva);
                var icdPattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/gi;
                var exclusiva = orangeproton.mindmap.generateBubbles(exc, 10, 'exclusiva', icdPattern);

                var inclusiva = orangeproton.mindmap.generateBubbles(data.inclusiva, options.max_inclusiva, 'inclusiva', icdPattern);
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
    var panelHidden = mindmapper.panelHidden();

    var amount = !panelHidden ? "-69" : "171";
    var width = !panelHidden ? "0" : "250";
    var panel = $("#hide-panels");

    $panels.animate({"width": width + "px"}, "fast");
    panel.animate({"right": amount + "px"}, "fast", function () {
        orangeproton.mindmap.resizeMindmap();
        $(document).trigger('paramChange', [null, null, true]);
    });


    panel.html(orangeproton.language.getPanelTogglerText());
    //panel.rotate(-90);
    $panels.data('hidden', !panelHidden);
}