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

    $("#code-name").focus();

    if (getUrlVars()["code"] !== undefined) {
        var code = getUrlVars()["code"].toUpperCase();
        var lang = getUrlVars()["lang"] || "de";

        mindmapper.sendRequest(code, lang);
        $("#code-name").val(code);
        $("#lang").val(lang);
    }

    setLocale($("#lang").val());
});


var mindmapper = {

    spinner_opts : {
        lines: 13, // The number of lines to draw
        width: 4, // The line thickness
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false // Whether to use hardware acceleration
    },

    // This method sends ajax requests to the API
    sendRequest: function (input, lang) {
        this.log(input);
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
                $('#mindmap').spin(false);
                History.pushState(null, "OrangeProton", params);

                var data = response.data; // text is already parsed by JQuery

                var name = data.text;

              var mm = $('#mindmap');

              var container = mm.megamind();      //initialize
              var rootNode = "<div class='root node ui-draggable'>" + input + "</br>" + name + "</div>";
              var root = mm.setRoot(rootNode);


                /*###################################*/
                /*#####   How to use MEGAMIND   #####*/
                /*###################################*/

                /* Megamind has a concept of different containers where the different nodes are put. This allows us to
                 split up the page to organize the nodes as we wish. Inside the containers, the nodes are automatically
                 laid out and distributed. Here are the instructions for generating a new container and adding nodes:
                 - create an array which holds the nodes. This is pretty straightforward, just see the examples below
                 - Call the Canvas constructor. The arguments are: new Canvas(left,top,width,height). All are CSS-pixel values
                 - chain a call to .addNodes(r), specifying the array of nodes. You can add multiple node-types and -sizes in
                 this array. You can also add click handlers or images or the <cat> element to the nodes.
                 - chain a call to .doLayout(). This distributes the nodes and makes them fill up the container more or less.

                 Notes:

                 You get the picture. Please don't kill hedgehogs.
                 */

                var r = [];
                var syn = data.synonyms;

                if(AS_LIST)
                {
                    var syns = '<ul>';
                    for (var i = 0; i < Math.min(MAX_SYN, syn.length); i++) {
                       syns += '<li>'+ syn[i] +'</li>'
                    }
                    syns += '</ul>'
                    var newdiv = $('<div class="syn node ui-draggable">' + syns + '</div>');
                    r.push(newdiv);
                }
                else
                {
                    for (var i = 0; i < Math.min(MAX_SYN, syn.length); i++) {
                        //mm.addNode(root, '<div class="syn">' + syn[i] + '</div>', {});
                        var newdiv = $('<div class="syn node ui-draggable">' + syn[i] + '</div>');
                        r.push(newdiv);
                    }
                }

                var superclass = data.superclass;
                var super_name = data.superclass_text == undefined ? "" : data.superclass_text;
                //mm.addNode(root, '<div class="super">' + superclass + '<br />' + super_name + '</div>', {});
                var newdiv = $('<div class="super node ui-draggable">' + superclass + '<br />' + super_name + '</div>');
                r.push(newdiv);

              var c = mm.addCanvas(root.position().left + root.outerWidth(), 0, container.width() - root.outerWidth() - root.position().left - $('#legend').outerWidth(), container.height());
              c.addNodes(r);

                var p = [];
                var drgs = data.drgs;
                for (var i = 0; i < Math.min(MAX_DRGS, drgs.length); i++) {
                    //mm.addNode(root, '<div class="drg">' + drgs[i] + '</div>', {});
                    var newdiv = $('<div class="drg node ui-draggable">' + drgs[i] + '</div>');
                    p.push(newdiv);
                }
                var c = mm.addCanvas(root.position().left - 100, 0, root.outerWidth() + 100, root.position().top);
              c.addNodes(p);

                var s = [];
                var exclusiva = data.exclusiva;
                for (var i = 0; i < Math.min(MAX_EXCLUSIVA, exclusiva.length); i++) {
                    //mm.addNode(root, '<div class="exclusiva">' + exclusiva[i] + '</div>', {});
                  var newdiv = $('<div class="exclusiva node ui-draggable">' + exclusiva[i] + '</div>');
                    s.push(newdiv);
                }

                var inclusiva = data.inclusiva;
                for (var i = 0; i < Math.min(MAX_INCLUSIVA, inclusiva.length); i++) {
                    //mm.addNode(root, '<div class="inclusiva">' + inclusiva[i] + '</div>', {});
                    var newdiv = $('<div class="inclusiva node ui-draggable">' + inclusiva[i] + '</div>');
                    s.push(newdiv);
                }

                var fields = response.fields;
                for (var i = 0; i < Math.min(MAX_FIELDS, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var c = Math.floor((r * 156) + 100).toString(16); //The more related the brighter
                    var color = '#' + c + c + c; //Color is three times c, so it's always grey
                    //mm.addNode(root, '<div class="cat" style="background-color:' + color +'">' + f + ': ' + n + '</div>', {});
                    //$newdiv = $('<div id=speciality class="cat node ui-draggable" style="background-color:' + color +'">' + f + ': ' + n + '</div>');
                  var newdiv = $('<div class="cat node ui-draggable" onclick="mindmapper.getDoctors(7.444,46.947,' + f + ');" style="background-color:' + color + '">' +  f + ': ' + n +'</div>');
                    s.push(newdiv);
                }

              var c = mm.addCanvas(0, 0, root.position().left - 100, container.height());
                  c.addNodes(s);
            },

            error: function (xhr, status, error) {
                alert(error);
            }
        });
    },

    //Get the doctors from the db specific to the field and the users location
    //TODO long & lat from interface
    //TODO delete previous Doctor node in Megamind and get Parent note to adjust the Layout
    getDoctors: function (long, lat, fields) {
        var DOC_COUNT = 4;
        jQuery.ajax({
            url: '/api/v1/docs/get?long=' + long + '&lat=' + lat + '&field=' + fields + '&count=' + DOC_COUNT,
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response, status) {
                //Get the already created MM from the get ICD request
                var mm = $('#mindmap');

                var s = [];
                for (var i = 0; i < Math.min(DOC_COUNT, response.length); i++) {
                    //TODO add and Format the other Attributes to the Output
                    //mm.addNode(root, '<div class="doctors">' + response[i].name + '</div>', {});
                    $newdiv = $('<div class="doc node ui-draggable">'
                        + response[i].name + '<br />'
                        + response[i].address + ' <br />'
                        + response[i].phone2 + ' <br />' + '</div>');
                    $newdiv.appendTo('body');
                    s.push($newdiv);
                }
                new Canvas(50, 120, 500, 600).addNodes(s).doLayout();

            },
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    },

    getSpeciality: function (input) {
        // TODO
    }
}

function getGeolocation() {

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