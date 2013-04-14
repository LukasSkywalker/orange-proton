// This file handes search requests. It makes the AJAX-request and parses and displays the result.
// TODO:
// -namespace the whole file so we don't pollute 'window' too much (low priority)
// -rethink the for-loops. maybe we could simplify them

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

  $("#location-config").on('click', null, function () {
    function getLocation() {
      jQuery.fancybox.close();
      orangeproton.location.getUserLocation($('#userLocation').val());
    }

    var content = 'Ort: <input type="text" id="userLocation">';
    orangeproton.generic.messageBox('Location', content, ['Ok'], [getLocation]);
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
    setLocale(lang);
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
    GMaps.geocode({
      lat: lat,
      lng: lng,
      callback: function (results, status) {
        if (status == 'OK') {
          $('#location').html(results[0].formatted_address.ellipses(30));
        }
      }
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

    if (codeParam !== undefined && codeParam !== '') {
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

    $code.val(code);
    $lang.val(lang);
    mindmapper.sendRequest(code, lang);
  }

  // set the locale and load translations
  setLocale($lang.val());

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
   *  Push a new history state on the stack. Call this to start a new search
   *  @method sendRequest
   *  @param {String} code the ICD/CHOP code
   *  @param {String} lang the language
   */
  sendRequest: function (code, lang) {
    var $code = $('#code-name');
    var $lang = $('#lang');
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
          var syn = data.synonyms.slice(0, orangeproton.options.display.max_syn);
          var newdiv = $.map(syn,function (el) {
            return '<li>{0}</li>'.format(el);
          }).join('');

          if (newdiv != '')
            synonyms.push($('<div class="syn"><ul>{0}</ul></div>'.format(newdiv)));
        }
        else {
          synonyms = mindmapper.generateHTML(data.synonyms, orangeproton.options.display.max_syn, 'syn');
        }

        var superclass = data.superclass;
        if (superclass) {
          var super_name = data.superclass_text == undefined ? "" : data.superclass_text;
          var newdiv = $('<div class="super">{0}<br />{1}</div>'.format(superclass, super_name));
          if (superclass.indexOf('-') === -1) {    //only allow click for non-ranges
            newdiv.addClass('clickable');
            newdiv.on('click', { superclass: superclass }, function getSuperData(e) {
              var code = e.data.superclass;
              var lang = $("#lang").val();
              $("#code-name").val(code);
              mindmapper.sendRequest(code, lang);
              $('#mindmap').megamind('setRoot', this, true);
            });
          }
          synonyms.push(newdiv);
        }

        if (data.subclasses) {
          $.each(data.subclasses.slice(0, orangeproton.options.display.max_sub), function (index, name) {
            var element = jQuery('<div/>').addClass('sub').html(name).on('click', { code: name }, function (e) {
              var code = e.data.code;
              var lang = $('#lang').val();
              mindmapper.sendRequest(code, lang);
              $('#mindmap').megamind('setRoot', this, true);
            });
            synonyms.push(element);
          });
        }

        var c = $mm.megamind('addCanvas', root.position().left + root.outerWidth(), 0, container.width() - root.outerWidth() - root.position().left, container.height());
        c.addNodes(synonyms);

        var drgs = mindmapper.generateHTML(data.drgs, orangeproton.options.display.max_drgs, 'drg');
        var c = $mm.megamind('addCanvas', root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
        c.addNodes(drgs);

        var exclusiva = [];
        if (data.subclasses) {
          var exc = data.exclusiva.slice(0, orangeproton.options.display.max_exclusiva);
          $.each(exc, function (index, name) {
            var icd_pattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/;
            var result = icd_pattern.exec(name);
            if (result == null) return true; // skip to next iteration
            var code = result[1];
            var element = jQuery('<div/>').addClass('exclusiva').html(name).on('click', { code: code }, function (e) {
              var code = e.data.code;
              var lang = $('#lang').val();
              mindmapper.sendRequest(code, lang);
              $('#mindmap').megamind('setRoot', this, true);
            });
            exclusiva.push(element);
          });
        }

        var inclusiva = [];
        if (data.inclusiva)
          inclusiva = mindmapper.generateHTML(data.inclusiva, orangeproton.options.display.max_inclusiva, 'inclusiva');

        var s = [];
        var fields = response.result.fields;
        for (var i = 0; i < Math.min(orangeproton.options.display.max_fields, fields.length); i++) {
          var f = fields[i].field;
          var n = fields[i].name;
          var r = fields[i].relatedness;
          var c = Math.floor((r * 156) + 100).toString(16); //The more related the brighter
          var color = '#' + c + c + c; //Color is three times c, so it's always grey
          var newdiv = $('<div class="cat" style="background-color:{0}">{1}: {2}</i></div>'.format(color, f, n));
          newdiv.on('click', { field: f }, function (e) {
            $(this).spin(orangeproton.options.libraries.spinner);
            var lat = orangeproton.location.getLocation().lat;
            var lng = orangeproton.location.getLocation().lng;
            mindmapper.getDoctors(e.data.field, lang, lat, lng);
          });
          s.push(newdiv);
        }

        var c = $mm.megamind('addCanvas', 0, 0, root.position().left - 100, container.height());
        c.addNodes(s.concat(exclusiva).concat(inclusiva));
      },

      error: mindmapper.handleApiError,

      complete: function () {
        $('#mindmap').spin(false);
      }
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
   * generate a div from a collection of strings and returns their jQuery objects
   * @param {String[]} collection the content of the divs as array
   * @param {Number} limit max number of elements to generate
   * @param {String} className the class to add to the elements
   * @returns {HTMLElement[]} the divs
   */
  generateHTML: function (collection, limit, className) {
    var elements = [];
    if (!collection) return elements;
    collection = collection.slice(0, limit);
    $.each(collection, function (index, name) {
      var element = jQuery('<div/>').addClass(className).html(name);
      elements.push(element);
    });
    return elements;
  },

  /**
   * Get the doctors from the db specific to the field and the users location
   * @param {Number} fields number of the speciality
   * @param {Number} lang search language
   * @param {Number} lat user's latitude
   * @param {Number} lng user's longitude
   */
  getDoctors: function (fields, lang, lat, lng) {
    $('.docOverlay').remove();  //delete previously loaded stuff
    var count = orangeproton.options.display.max_docs;

    jQuery.ajax({
      url: '/api/v1/docs/get?lat={0}&long={1}&field={2}&count={3}'.format(lat, lng, fields, count),
      type: 'GET',
      dataType: 'json',
      contentType: "charset=UTF-8",
      success: function (response) {
        $('.docoverlay').remove();  //delete previously loaded stuff
        var status = response.status;
        if (status === 'error') {
          var message = response.message;
          alert(message);
          return;
        }

        var $overlay = $('<div class="docOverlay"></div>');
        var $docList = $('<div id="docList"><ul></ul></div>');
        var $map = $('<div id="map"></div>');
        var $mapFrame = $('<iframe id="map-frame"></div>');
        $map.append($mapFrame);
        $overlay.append($docList).append($map).append('<div style="clear:both;"></div>');
        var docs = response.result;
        for (var i = 0; i < docs.length; i++) {
          var doc = docs[i];
          var title = doc.title;
          var name = doc.name;
          var address = doc.address.replace(/,\s*/gi, "<br />");
          var url = 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl={0}' +
              '&q={1}&t=h&z=17&output=embed'
                  .format(lang, encodeURIComponent(doc.name + ', ' + doc.address + ', Schweiz'));
          var element =
              '<input id="docItem-{0}" class="docItem" type="radio" name="doctors">'
                  + '<label class="docLabel" for="docItem-{0}" >'
                  + '  <p class="doc doc-title">{1}</p>'
                  + '  <p class="doc address">{2}<br />{3}</p>'
                  + '</label>'
                  + '</input>';
          var $menuItem = $(element.format(i, title, name, address));

          $menuItem.on('change', {url: url, details: doc}, function doctorClick(e) {
            $('#map-frame').first().attr('src', e.data.url);


          });
          $docList.append($menuItem);
        }

        $.fancybox($overlay[0], orangeproton.options.libraries.fancybox);

        //Show First your current Location
        $('#map-frame').first().attr('src', 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl={0}' +
            '&q={1}&t=h&z=17&output=embed'
                .format(lang, encodeURIComponent(orangeproton.location.getLocation().lat + "," + orangeproton.location.getLocation().lng)));
      },

      error: mindmapper.handleApiError,

      complete: function () {
        $('.spinner').remove();
      }
    });
  }

  /*getSpeciality: function (input) {
    // TODO
  }*/
};

/**
 * Set the language and reload translatable UI-elements
 * @param {String} locale the new language
 */
function setLocale(locale) {
  I18n.locale = locale || "de";
  updateUiLanguage();
}

/**
 * load the legend in the right translation
 */
function updateUiLanguage() {
  $('#legend-text').empty();

  var identifiers = ['syn', 'cat', 'super', 'sub', 'drg', 'exclusiva', 'inclusiva'];

  $.each(identifiers, function (index, name) {
    $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend-text');
  });

  $('#legend-title').html('<p>' + I18n.t('legend') + '</p>');
}

