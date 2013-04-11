// This file handes search requests. It makes the AJAX-request and parses and displays the result.
// TODO:
// -namespace the whole file so we don't pollute 'window' too much (low priority)
// -rethink the for-loops. maybe we could simplify them

$(document).ready(function () {
    // load the admin interface
    displayAdmin();

    // add event handler for code searches
    $("#code-name").keyup(function (e) {
        var code = e.which; // normalized across browsers, use this :-)
        if (code == 13) e.preventDefault();
        if (code == 32 || code == 13 || code == 188 || code == 186) {  // 32 = space, 13 = enter, 188 = comma, 186 = semi-colon
            mindmapper.sendRequest($(this).val().toUpperCase(), $("#lang").val());
        }
    });

    // click handler for search button
    $("#search-button").on('click', null, function(){
      var code = $('#code-name').val().toUpperCase();
      var lang = $('#lang').val();
      mindmapper.sendRequest(code, lang);
    });

    // event handler for language change on UI element
    $("#lang").change(function () {
        var code =  $("#code-name").val().toUpperCase();
        var lang = $(this).val();
        if(code !== ""){
           mindmapper.sendRequest(code, lang);
        }
        setLocale(lang);
    });

    // start position detection
    // TODO: add shim for IE
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function success( position ) {
        mindmapper.lat = position.coords.latitude;
        mindmapper.long = position.coords.longitude;
      }, function error( msg ) {
        alert(typeof msg == 'string' ? msg : "error");
      });
    }


    // overwrite window.alert() with a much fancier alternative
    function betterAlert( msg ) {
      jQuery.fancybox({'modal' : true, 'content' : '<div style="margin:1px;width:240px;">'+msg+'<div style="text-align:right;margin-top:10px;"><input class="confirm-button" style="margin:3px;padding:0px;" type="button" onclick="jQuery.fancybox.close();" value="Ok"></div></div>'});
      $('.confirm-button').focus();
    }
    window.alert = betterAlert;

    $("#code-name").focus();

    var codeParam = generic.getUrlVars()["code"];
    if (codeParam !== undefined && codeParam !== '') {
        var code = codeParam.toUpperCase();
        var lang = generic.getUrlVars()["lang"] || "de";

        mindmapper.sendRequest(code, lang);
    }

    // set the locale and load translations
    setLocale($("#lang").val());

    // add svg class to elements with SVG components
    if (generic.supportsSVG()) {
      $('.hide-arrow').addClass('svg');
    }
});

var mindmapper = {
    // updates the variable UI components. call after code and language change
    updateUI: function(code, lang) {
      $("#code-name").val(code);
      $("#lang").val(lang);
      History.pushState(null, "OrangeProton", "?code="+code+"&lang="+lang);
    },

    // This method sends ajax requests to the API
    sendRequest: function (input, lang) {
        this.updateUI(input, lang);
        this.getICD(input, lang);
        // TODO mindmapper.getSpeciality(input);
    },

    getICD: function (input, lang) {
        var params = '?code={0}&lang={1}'.format(input, lang);
        $('#mindmap').cleanUp();

        $('#mindmap').spin(orangeproton.options.libraries.spinner);

        jQuery.ajax({
            url: '/api/v1/fields/get' + params + '&count=4',
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response, status) {
              $('#mindmap').cleanUp();
              History.pushState(null, "OrangeProton", params);

              var status = response.status;
              if( status === 'error' ) {
                var message = response.message;
                alert(message);
                return;
              }

              var data = response.result.data; // text is already parsed by JQuery

              var name = data.text;

              var mm = $('#mindmap');

              var container = mm.megamind();      //initialize
              var rootNode = "<div class='root'>{0}</br>{1}</div>".format(input, name);
              var root = mm.setRoot(rootNode);
                var synonyms = [];

                if(orangeproton.options.display.as_list)
                {
                    var syn = data.synonyms.slice(0, orangeproton.options.display.max_syn);
                    var newdiv = $.map(syn, function(el) {
                      return '<li>{0}</li>'.format(el);
                    }).join('');

                    if(newdiv != '')
                      synonyms.push($('<div class="syn"><ul>{0}</ul></div>'.format(newdiv)));
                }
                else
                {
                    synonyms = mindmapper.generateHTML(data.synonyms, orangeproton.options.display.max_syn, 'syn');
                }

                var superclass = data.superclass;
                if(superclass) {
                  var super_name = data.superclass_text == undefined ? "" : data.superclass_text;
                  var newdiv = $('<div class="super">{0}<br />{1}</div>'.format(superclass, super_name));
                  newdiv.on('click', { superclass: superclass }, function getSuperData(e){
                    var code = e.data.superclass;
                    if( code.indexOf('-') === -1 ) {    //only search non-ranges
                      var lang = $("#lang").val();
                      $("#code-name").val(code);
                      mindmapper.sendRequest(code, lang);
                      $('#mindmap').setRoot(this, true);
                    }
                  });
                  synonyms.push(newdiv);
                }

                $.each(data.subclasses.slice(0, orangeproton.options.display.max_sub), function(index, name) {
                  var element = jQuery('<div/>').addClass('sub').html(name).on('click', { code: name }, function(e){
                    var code = e.data.code;
                    var lang = $('#lang').val();
                    mindmapper.sendRequest(code, lang);
                    $('#mindmap').setRoot(this, true)
                  });
                  synonyms.push(element);
                });

                var c = mm.addCanvas(root.position().left + root.outerWidth(), 0, container.width() - root.outerWidth() - root.position().left - $('#legend').outerWidth(), container.height());
                c.addNodes(synonyms);

                var drgs = mindmapper.generateHTML(data.drgs, orangeproton.options.display.max_drgs, 'drg');
                var c = mm.addCanvas(root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
                c.addNodes(drgs);

                var exclusiva = [];
                var exc = data.exclusiva.slice(0, orangeproton.options.display.max_exclusiva);
                $.each(exc, function(index, name) {
                  var icd_pattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/;
                  var result = icd_pattern.exec(name);
                  if( result == null ) return true; // skip to next iteration
                  var code = result[1];
                  var element = jQuery('<div/>').addClass('exclusiva').html(name).on('click', { code: code }, function(e){
                    var code = e.data.code;
                    var lang = $('#lang').val();
                    mindmapper.sendRequest(code, lang);
                    $('#mindmap').setRoot(this, true)
                  });
                  exclusiva.push(element);
                });

                var inclusiva = mindmapper.generateHTML(data.inclusiva, orangeproton.options.display.max_inclusiva, 'inclusiva');

                var s = [];
                var fields = response.result.fields;
                for (var i = 0; i < Math.min(orangeproton.options.display.max_inclusiva, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var c = Math.floor((r * 156) + 100).toString(16); //The more related the brighter
                    var color = '#' + c + c + c; //Color is three times c, so it's always grey
                    var newdiv = $('<div class="cat" style="background-color:{0}">{1}: {2}</div>'.format(color, f, n));
                    newdiv.on('click', { field: f }, function(e){
                      $(this).spin(orangeproton.options.libraries.spinner);
                      mindmapper.getDoctors(e.data.field,lang);
                    });
                    s.push(newdiv);
                }

              var c = mm.addCanvas(0, 0, root.position().left - 100, container.height());
                  c.addNodes(s.concat(exclusiva).concat(inclusiva));
            },

            error: mindmapper.handleApiError,

            complete: function(xhr, status) {
                $('#mindmap').spin(false);
            }
        });
    },

    handleApiError: function(xhr, httpStatus, error) {
      try{
        var message = jQuery.parseJSON(xhr.responseText).error;
        alert(message);
      }catch(e) {
        alert(error);
      }
    },

    // generates a div from a collection of strings and returns their jQuery objects
    generateHTML: function(collection, limit, className) {
      var elements = [];
      if(!collection) return elements;
      collection = collection.slice(0, limit);
      $.each(collection, function(index, name) {
        var element = jQuery('<div/>').addClass(className).html(name);
        elements.push(element);
      });
      return elements;
    },

    //Get the doctors from the db specific to the field and the users location
    //TODO delete previous Lines of Doctor nodes in Megamind
    getDoctors: function (fields, lang) {
        $('.docoverlay').remove();  //delete previously loaded stuff
        var lat = orangeproton.options.defaultLocation.lat;
        var lng = orangeproton.options.defaultLocation.lng;
        var count = orangeproton.options.display.max_docs;

        jQuery.ajax({
            url: '/api/v1/docs/get?lat={0}&long={1}&field={2}&count={3}'.format(lat, lng, fields, count),
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response, status) {
                $('.docoverlay').remove();  //delete previously loaded stuff
                var status = response.status;
                if( status === 'error' ) {
                  var message = response.message;
                  alert(message);
                  return;
                }

                var overlay = $('<div class="docoverlay"/>');
                var doclist = $('<div id="doclist"><ul></ul></div>');
                var map = $('<div id="map"/>');
                var mapframe = $('<iframe align="center" id="map-frame"/>');
                map.append(mapframe);
                overlay.append(doclist).append(map).append('<div style="clear:both;"/>');
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
                      '<input id="docitem-{0}" class="docitem" type="radio" name="doctors">'
                    +   '<label for="docitem-{0}" >'
                    +   '  <p class="doc title">{1}</p>'
                    +   '  <p class="doc address">{2}<br />{3}</p>'
                    +   '</label>'
                    + '</input>';
                    var menuitem = $(element.format(i, title, name, address));



                    menuitem.on('change', {url: url, details: doc}, function doctorClick(e) {
                      $('#map-frame').first().attr('src', e.data.url);
                    });
                    doclist.append(menuitem);
                }

                $.fancybox(overlay[0], orangeproton.options.libraries.fancybox);

                //Show First your current Location
                $('#map-frame').first().attr('src', 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl={0}' +
                    '&q={1}&t=h&z=17&output=embed'
                        .format(lang, encodeURIComponent(mindmapper.lat+","+mindmapper.long)));
            },

            error: mindmapper.handleApiError,

            complete: function() {
              $('.spinner').remove();
            }
        });
    },

    getSpeciality: function (input) {
        // TODO
    }
}

function setLocale(locale) {
    I18n.locale = locale || "de";
    updateUiLanguage();
}

// load the legend and search button in the right translation
function updateUiLanguage() {
  $('#legend').empty();

  var identifiers = ['syn', 'cat', 'doc', 'super', 'sub', 'drg', 'exclusiva', 'inclusiva'];

  $.each(identifiers, function(index, name) {
    $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend');
  });

  $('#search-button').val(I18n.t('search'));
}
