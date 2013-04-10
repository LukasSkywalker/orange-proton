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

    // event handler for language change on UI element
    $("#lang").change(function () {
        var code =  $("#code-name").val().toUpperCase();
        var lang = $(this).val();
        if(code !== ""){
           mindmapper.sendRequest(code, lang);
        }
        setLocale(lang);
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function success( position ) {
        mindmapper.lat = position.coords.latitude;
        mindmapper.long = position.coords.longitude;
      }, function error( msg ) {
        alert(typeof msg == 'string' ? msg : "error");
      });
    }

    
    
    function betterAlert( msg ) {
      jQuery.fancybox({'modal' : true, 'content' : '<div style="margin:1px;width:240px;">'+msg+'<div style="text-align:right;margin-top:10px;"><input style="margin:3px;padding:0px;" type="button" onclick="jQuery.fancybox.close();" value="Ok"></div></div>'});
    }
    window.alert = betterAlert;

    $("#code-name").focus();

    var codeParam = getUrlVars()["code"];
    if (codeParam !== undefined && codeParam !== '') {
        var code = codeParam.toUpperCase();
        var lang = getUrlVars()["lang"] || "de";

        mindmapper.sendRequest(code, lang);
    }

    setLocale($("#lang").val());
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

    log: function (text) {
        // IE does not know the console object
        if (window.console) {
            console.log(text);
        }
    },

    getICD: function (input, lang) {
        var MAX_SYN = 5; // max number of synonyms to display
        var MAX_FIELDS = 5; // max number of fields
        var MAX_DRGS = 5;
        var MAX_INCLUSIVA = 5;
        var MAX_EXCLUSIVA = 5;
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
                    var lang = $("#lang").val();
                    $("#code-name").val(code);
                    mindmapper.sendRequest(code, lang);
                    $('#mindmap').setRoot(this, true);
                  });
                  synonyms.push(newdiv);
                }

                var c = mm.addCanvas(root.position().left + root.outerWidth(), 0, container.width() - root.outerWidth() - root.position().left - $('#legend').outerWidth(), container.height());
                c.addNodes(synonyms);

                var drgs = mindmapper.generateHTML(data.drgs, MAX_DRGS, 'drg');
                var c = mm.addCanvas(root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
                c.addNodes(drgs);

                var exclusiva = [];
                var exc = data.exclusiva.slice(0, MAX_EXCLUSIVA);
                $.each(exc, function(index, name) {
                  var icd_pattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/;
                  var code = icd_pattern.exec(name)[1];
                  var element = jQuery('<div/>').addClass('exclusiva').html(name).on('click', { code: code }, function(e){
                    var code = e.data.code;
                    var lang = $('#lang').val();
                    mindmapper.sendRequest(code, lang);
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
                    newdiv.on('click', { field: f }, function(e){ mindmapper.getDoctors(e.data.field,lang); });
                    s.push(newdiv);
                }

              var c = mm.addCanvas(0, 0, root.position().left - 100, container.height());
                  c.addNodes(s.concat(exclusiva).concat(inclusiva));
            },

            error: function (xhr, httpStatus, error) {
                try{
                  var message = jQuery.parseJSON(xhr.responseText).error;
-                 alert(message);
                }catch(e) {
                  alert(error);
                }
            },
            
            complete: function(xhr, status) {
                $('#mindmap').spin(false);
            }
        });
    },

    generateHTML: function(collection, limit, className, nameFunction) {
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
        $('.doc').remove();  //delete previously loaded stuff

        jQuery.ajax({
            url: '/api/v1/docs/get?long=' + mindmapper.long + '&lat=' + mindmapper.lat + '&field=' + fields + '&count=' + DOC_COUNT,
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response, status) {
                
                var status = response.status;
                if( status === 'error' ) {
                  var message = response.message;
                  alert(message);
                  return;
                }

                var s = [];
                var docs = response.result;
                for (var i = 0; i < Math.min(DOC_COUNT, docs.length); i++) {
                    var url = encodeURI('http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl='+lang+'&q='+docs[i].name+',+'+docs[i].address+',+Schweiz&t=h&z=17&output=embed');
                    var newdiv = $('<div class="doc">'
                        + docs[i].title + ',<br />'
                        + docs[i].name + ', <br />'
                        + '<a class="doctor-map fancybox.iframe" href='+url+'>'
                        + docs[i].address + ' <br />'
                        + '</a></div>'
                        );
                        s.push(newdiv);
                }

                new Canvas(440,550, 800, 400).addNodes(s);

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
                });
            },
            error: function (xhr, status, error) {
              try{
                var message = jQuery.parseJSON(xhr.responseText).error;
-               alert(message);
              }catch(e) {
                alert(error);
              }
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
    displayLegend();
}

function displayLegend() {
    $('#legend').empty();

    var identifiers = ['syn', 'cat', 'doc', 'super', 'drg', 'exclusiva', 'inclusiva'];

    $.each(identifiers, function(index, name) {
        $('<div class="' + name + ' legend">' + I18n.t(name) + '</div>').appendTo('#legend');
    });
}
