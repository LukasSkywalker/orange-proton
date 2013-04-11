// This file handes search requests. It makes the AJAX-request and parses and displays the result.
// TODO:
// -define action when clicking a node
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

    var codeParam = getUrlVars()["code"];
    if (codeParam !== undefined && codeParam !== '') {
        var code = codeParam.toUpperCase();
        var lang = getUrlVars()["lang"] || "de";

        mindmapper.sendRequest(code, lang);
    }

    // set the locale and load translations
    setLocale($("#lang").val());

    // detect SVG support, by Modernizr
    function supportsSVG() {
      return !! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect;
    }

    // add svg class to elements with SVG components
    if (supportsSVG()) {
      $('.hide-arrow').addClass('svg');
    }
});


var mindmapper = {

    lat: 7.438637,
    long : 46.951081,

    spinner_opts : {
        lines: 13, // The number of lines to draw
        width: 4, // The line thickness
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false // Whether to use hardware acceleration
    },

    // updates the variable UI components. call after code and language change
    updateUI: function(code, lang) {
      $("#code-name").val(code);
      $("#lang").val(lang);
      History.pushState(null, "OrangeProton", "?code="+code+"&lang="+lang);
    },

    // This method sends ajax requests to the API
    sendRequest: function (input, lang) {
        this.log(input);
        this.updateUI(input, lang);
        this.getICD(input, lang);
        // TODO mindmapper.getSpeciality(input);
    },

    // check for console.log becaues IE does not implement it
    log: function (text) {
        // IE does not know the console object
        if (window.console) {
            console.log(text);
        }
    },

    getICD: function (input, lang) {
        var MAX_SYN = 5; // max number of synonyms to display
        var MAX_FIELDS = 7; // max number of fields
        var MAX_DRGS = 10;
        var MAX_SUB = 5;
        var MAX_INCLUSIVA = 3;
        var MAX_EXCLUSIVA = 3;
        var AS_LIST = true; // if synonyms should be in a list instead of bubbles

        var params = '?code=' + input + '&lang=' + lang;


        $('#mindmap').cleanUp();

        $('#mindmap').spin(mindmapper.spinner_opts);

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
              var rootNode = "<div class='root'>" + input + "</br>" + name + "</div>";
              var root = mm.setRoot(rootNode);


                /*###################################*/
                /*#####   How to use MEGAMIND   #####*/
                /*###################################*/

                /* Megamind has a concept of different containers where the different nodes are put. This allows us to
                 split up the page to organize the nodes as we wish. Inside the containers, the nodes are automatically
                 laid out and distributed. Here are the instructions for generating a new container and adding nodes:
                 - initialize a mindmap. call megamind() on a jQuery object [let that be 'mm' here] that represents a
                 DOM node to do so
                 - set a root node by calling setRoot() on mm, with the HTML string of the node as parameter
                 - create an array which holds HTML-strings of the nodes. This is pretty straightforward, just see the examples below
                 - Call the Canvas constructor on mm: mm.addCanvas(left,top,width,height). All are CSS-pixel values
                 - Call .addNodes(r), specifying the array of nodes. You can add multiple node-types and -sizes in
                 this array. You can also add click handlers or images or the <cat> element to the nodes.

                 Notes:
                 - elements that are too tall are discarded. We will have to find a better solution for this

                 You get the picture.
                 */

                var synonyms = [];

                if(AS_LIST)
                {
                    var syn = data.synonyms.slice(0, MAX_SYN);
                    var newdiv = $.map(syn, function(el) {
                      return '<li>' + el + '</li>';
                    }).join('');

                    if(newdiv != '')
                      synonyms.push($('<div class="syn"><ul>' + newdiv + '</ul></div>'));
                }
                else
                {
                    synonyms = mindmapper.generateHTML(data.synonyms, MAX_SYN, 'syn');
                }

                var superclass = data.superclass;
                if(superclass) {
                  var super_name = data.superclass_text == undefined ? "" : data.superclass_text;
                  var newdiv = $('<div class="super">' + superclass + '<br />' + super_name + '</div>');
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

                $.each(data.subclasses.slice(0, MAX_SUB), function(index, name) {
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

                var drgs = mindmapper.generateHTML(data.drgs, MAX_DRGS, 'drg');
                var c = mm.addCanvas(root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
                c.addNodes(drgs);

                var exclusiva = [];
                var exc = data.exclusiva.slice(0, MAX_EXCLUSIVA);
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

                var inclusiva = mindmapper.generateHTML(data.inclusiva, MAX_INCLUSIVA, 'inclusiva');

                var s = [];
                var fields = response.result.fields;
                for (var i = 0; i < Math.min(MAX_FIELDS, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var c = Math.floor((r * 156) + 100).toString(16); //The more related the brighter
                    var color = '#' + c + c + c; //Color is three times c, so it's always grey
                    var newdiv = $('<div class="cat" style="background-color:' + color + '">' +  f + ': ' + n +'</div>');
                    newdiv.on('click', { field: f }, function(e){
                      $(this).spin(mindmapper.spinner_opts);
                      mindmapper.getDoctors(e.data.field,lang);
                    });
                    s.push(newdiv);
                }

              var c = mm.addCanvas(0, 0, root.position().left - 100, container.height());
                  c.addNodes(s.concat(exclusiva).concat(inclusiva));
            },

            error: function (xhr, httpStatus, error) {
                try{
                  var message = jQuery.parseJSON(xhr.responseText).error;
                  alert(message);
                }catch(e) {
                  alert(error);
                }
            },

            complete: function(xhr, status) {
                $('#mindmap').spin(false);
            }
        });
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
        var DOC_COUNT = 4;
        $('.docoverlay').remove();  //delete previously loaded stuff

        jQuery.ajax({
            url: '/api/v1/docs/get?long=' + mindmapper.long + '&lat=' + mindmapper.lat + '&field=' + fields + '&count=' + DOC_COUNT,
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
                    var url = 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl='+lang+
                        '&q='+encodeURIComponent(doc.name + ', ' + doc.address + ', Schweiz')+
                        '&t=h&z=17&output=embed';
                    var menuitem = $('<input id="docitem-'+i+'" class="docitem" type="radio" name="doctors">'
                        + '<label for="docitem-'+i+'" ><p class="doc title">'
                        + doc.title + '</p><p class="doc address">'
                        + doc.name + '<br />'
                        + doc.address.replace(/,\s*/gi, "<br />") + '</p></label></input>');
                    menuitem.on('change', {url: url, details: doc}, function doctorClick(e) {
                      $('#map-frame').first().attr('src', e.data.url);
                    });
                    doclist.append(menuitem);
                }

                $.fancybox(overlay[0], {
                  maxWidth	: 1000,
                  maxHeight	: 600,
                  fitToView	: false,
                  width		: '70%',
                  height		: '70%',
                  autoSize	: false,
                  closeClick	: false,
                  openEffect	: 'none',
                  closeEffect	: 'none'
                });
                /*new Canvas(440,550, 800, 400).addNodes(s);


                $(".doctor-map").fancybox({
                    maxWidth	: 800,
                    maxHeight	: 600,
                    fitToView	: false,
                    width		: '70%',
                    height		: '70%',
                    autoSize	: false,
                    closeClick	: false,
                    openEffect	: 'none',
                    closeEffect	: 'none'
                });*/
            },
            error: function (xhr, status, error) {
              try{
                var message = jQuery.parseJSON(xhr.responseText).error;
                alert(message);
              }catch(e) {
                alert(error);
              }
            },
            complete: function() {
              $('.spinner').remove();
            }
        });
    },

    getSpeciality: function (input) {
        // TODO
    }
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
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
