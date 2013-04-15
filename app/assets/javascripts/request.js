var orangeproton = orangeproton || {};

$(document).ready(function () {
  var $code = $('#code-name');
  var $lang = $('#lang');

  /**
   * load the admin interface
   */
  orangeproton.admin.loadPanel();

  /**
   * add event handler for code searches
   */
  $code.keyup(function (e) {
    var code = e.which; // normalized across browsers, use this :-)
    if (code == 13) e.preventDefault();
    if (code == 32 || code == 13 || code == 188 || code == 186) {  // 32 = space, 13 = enter, 188 = comma, 186 = semi-colon
      mindmapper.sendRequest($(this).val().toUpperCase(), $("#lang").val());
    }
  });

  /**
   * add event handler for legend toggling
   */
  $("#legend-title").click(function () {
    $("#legend-text").toggle("blind");
  });

  /**
   * add event handler for admin panel toggling
   */
  $("#admin-title").click(function () {
    $("#admin-text").toggle("blind");
  });

  /**
   * add click handler for search button
   */
  $("#search-button").on('click', null, function () {
    var code = $('#code-name').val().toUpperCase();
    var lang = $('#lang').val();
    mindmapper.sendRequest(code, lang);
  });

  /**
   * add click handler for location display
   */
  $('#location').on('click', null, function() {
    var location = orangeproton.location.getLocation();
    var $map = $('<div id="user-location"></div>');
    $map.width(800).height(600);
    $map.appendTo('body');
    var map = new GMaps({
      div: '#user-location',
      lat: location.lat,
      lng: location.lng
    });
    map.addMarker({
      lat: location.lat,
      lng: location.lng,
      draggable: true,
      dragend: function (e) {
        var position = e.latLng;
        mindmapper.userLocation = {lat: position.lat(), lng: position.lng()};
        orangeproton.location.reverseGeoCode(position.lat(), position.lng(), function onGeocodeComplete(lat, lng, address) {
          $('#location').html(address.ellipses(30));
        });
      }
    });
    $.fancybox($map);
  });

  /**
   * add click handler for location configuration
   */
  $("#location-config").on('click', null, function () {
    function geoCodeLocation() {
      jQuery.fancybox.close();
      orangeproton.location.geoCodeUserLocation($('#userLocation').val());
    }

    var content = I18n.t('location') + ': <input type="text" id="userLocation">';
    orangeproton.generic.messageBox(I18n.t('location'), content, ['Ok'], [geoCodeLocation]);
  });

  /**
   * add event handler for language change on UI element
   */
  $lang.change(function () {
    var code = $("#code-name").val().toUpperCase();
    var lang = $(this).val();
    if (code !== "") {
      mindmapper.sendRequest(code, lang);
    }
    orangeproton.language.setLocale(lang);
  });

  /**
   * start position detection
   * geoLocationFallback is used when an error occurs or native geolocation
   * is unsupported
   */
  function geoLocationFallback() {
    function geoIpSuccess(lat, lng, country, city) {
      var location = city + ", " + country;
      $('#location').html(location.ellipses(30));
      mindmapper.geoLocation.lat = lat;
      mindmapper.geoLocation.lng = lng;
    }

    function geoIpError() {/* just fail silently */
    }

    orangeproton.location.getGeoIp(geoIpSuccess, geoIpError);
  }

  if ("geolocation" in navigator) {
    var lat = orangeproton.options.defaultLocation.lat;
    var lng = orangeproton.options.defaultLocation.lng;
    navigator.geolocation.getCurrentPosition(function success(position) {
      lat = mindmapper.geoLocation.lat = position.coords.latitude;
      lng = mindmapper.geoLocation.lng = position.coords.longitude;
    }, function error(error) {
      alert(error.message);
      geoLocationFallback();
    });
    orangeproton.location.reverseGeoCode(lat, lng, function onGeocodeComplete(lat, lng, address) {
      $('#location').html(address.ellipses(30));
    });
  } else {
    geoLocationFallback();
  }

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
    $("#code-name").val(code);
    $("#lang").val(lang);

    if (code !== undefined && code !== '') {
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
    mindmapper.sendRequest(code, lang);
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
  userLocation: null,
  geoLocation: {
    lat: orangeproton.options.defaultLocation.lat,
    lng: orangeproton.options.defaultLocation.lng
  },

  /**
   *  Push a new history state on the stack. Call this to start a new search. Pass null value
   *  to leave as-is.
   *  @method sendRequest
   *  @param {String} [code] the ICD/CHOP code
   *  @param {String} [lang] the language
   */
  sendRequest: function (code, lang) {
    var $code = $('#code-name');
    var $lang = $('#lang');
    if( !code ) code = $code.val();
    if( !lang ) lang = $lang.val();
    $code.val(code);
    $lang.val(lang);
    History.pushState({code: code, lang: lang}, "OrangeProton", "?code=" + code + "&lang=" + lang);
  },

  /**
   * Performs the API request and displays the data in the mindmap
   * DO NOT USE THIS METHOD EXCEPT IN THE HISTORY WATCHER!
   * call #sendRequest if you need to add a new state (new code/lang) or
   * `History.Adapter.trigger(window,'statechange')` if the parameters
   * haven't changed but you need to trigger a new search!
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
        var rootNode = "<div class='root'>{0}</br>{1}</div>".format(input, name);
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

        var patternNoDash = /^(.[0-9]{2}(\.[0-9]{1,2})?)</gi;  //matches a single ICD before a HTML-tag start
        var content = '{0}<br />{1}'.format(data.superclass, data.superclass_text || '');
        var superclasses = mindmapper.generateBubbles([content], 1, 'super', patternNoDash);

        var subclasses = mindmapper.generateBubbles(data.subclasses, options.max_sub, 'sub', /(.*)/gi);

        var c = $mm.megamind('addCanvas', root.position().left + root.outerWidth(), 0, container.width() - root.outerWidth() - root.position().left, container.height());
        c.addNodes(synonyms.concat(subclasses).concat(superclasses));

        var drgs = mindmapper.generateBubbles(data.drgs, orangeproton.options.display.max_drgs, 'drg');
        var c = $mm.megamind('addCanvas', root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
        c.addNodes(drgs);

        var icdPattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/gi;
        var exclusiva = mindmapper.generateBubbles(data.exclusiva, options.max_exclusiva, 'exclusiva', icdPattern);

        var inclusiva = mindmapper.generateBubbles(data.inclusiva, options.max_inclusiva, 'inclusiva', icdPattern);

        var s = [];
        var fields = response.result.fields;
        for (var i = 0; i < Math.min(options.max_fields, fields.length); i++) {
          var f = fields[i].field;
          var n = fields[i].name;
          var r = fields[i].relatedness;
          var c = Math.floor((r * 156) + 100).toString(16); //The more related the brighter
          var color = '#' + c + c + c; //Color is three times c, so it's always grey
          var newdiv = $('<div class="field" style="background-color:{0}">{1}: {2}</i></div>'.format(color, f, n));
          newdiv.on('click', { field: f }, function (e) {
            $(this).spin(orangeproton.options.libraries.spinner);
            var lat = orangeproton.location.getLocation().lat;
            var lng = orangeproton.location.getLocation().lng;
            orangeproton.doctor.getDoctors(e.data.field, lang, lat, lng);
          });
          s.push(newdiv);
        }

        var c = $mm.megamind('addCanvas', 0, 0, root.position().left - 100, container.height());
        c.addNodes(s.concat(exclusiva).concat(inclusiva));
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
      alert(error);
    }
  },

  /**
   * hides all running spinners if there are any
   */
  hideSpinner: function() {
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
  generateBubbles: function(contents, limit, className, pattern, data, click) {
    var bubbles = [];
    if(!contents) return bubbles;
    contents = contents.slice(0, limit); // set collection size limit
    $.each(contents, function (index, text) {
      var $element = $('<div></div>').addClass(className).html(text);
      if( pattern ) {
        var result = text.match(pattern);
        if( result ) {
          if(click){        //onclick handler was supplied
            $element.on('click', {data: data, match: result}, function(e) {
              console.log('click1');
              click(e.data.data, e.data.match);
            });
          }else{            //inject the default click handler
            $element.on('click', {match: result}, function(e) {
              var code = decodeURI(e.data.match[0]);
              code = code.replace('<', ''); //bad fix for a bad regex
              mindmapper.sendRequest(code);
              $('#mindmap').megamind('setRoot', this, true);
            });
          }
          $element.addClass('clickable');
        }else{
          //regex does not match
        }
      }
      bubbles.push($element);
    });
    return bubbles;
  }

  /*getSpeciality: function (input) {
    // TODO
  }*/
};