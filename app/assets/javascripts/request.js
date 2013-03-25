// This file handes search requests. It makes the AJAX-request and parses and displays the result.
// TODO:
// -the input field is locked after the first search (element floating above it or mindmap.js capturing onclicks?)
// -define action when clicking a node
// -use language defined in ui, not default (de)
// -namespace the whole file so we don't pollute 'window' too much
// -rethink the for-loops. maybe we could simplify them
// -when performing a search, a black line quickly appears from the top left corner to the center of the screen. Has probably something to do with .mindmap()-ing the <body> element, although this is equal to the example implementation.

$(document).ready(function () {
    $("#code-name").keyup(function (e) {
        var code = e.which; // normalized across browsers, use this :-)
        if (code == 13) e.preventDefault();
        if (code == 32 || code == 13 || code == 188 || code == 186) {  // 32 = space, 13 = enter, 188 = comma, 186 = semi-colon
            mindmapper.sendRequest($(this).val().toUpperCase(), $("#lang").val());
        }
    });
    
    $("#lang").change(function (e) {
        mindmapper.sendRequest($("#code-name").val().toUpperCase(), $(this).val());
    });

    var code = getUrlVars()["code"].toUpperCase();
    var lang = getUrlVars()["lang"];

    mindmapper.sendRequest(code, lang);
    document.getElementById("code-name").value = code;
    document.getElementById("lang").value = lang;
});


var mindmapper = {
    // This method sends ajax requests to the API
    sendRequest: function (input, lang) {
        this.log(input);
        this.getICD(input, lang);
        // TODO mindmapper.getSpeciality(input);
        // TODO mindmapper.getDoctors(input);
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

        var params = '?code=' + input + '&count=4&lang=' + lang;

        jQuery.ajax({
            url: '/api/v1/fields/get' + params,
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function (response, status) {
                // TODO: we should definitely change the removal routines here. This is US-style. kill everything that moves.
                // look at mindmap.js's source and try to find the "nodes" array in the window object to remove nodes and stuff from there.
                History.pushState(null, null, params);

                $(".node").remove();
                $("svg").remove();
                $("path").remove();

                $('#mindmap').mindmap();
                var data = response.data; // text is already parsed by JQuery
                var mm = $('#mindmap');

                var name = data.text;

                var root = $('#mindmap').addRootNode(input + "</br>" + name, {}); // define a root node to attach the other nodes to

                var syn = data.synonyms;
                for (var i = 0; i < Math.min(MAX_SYN, syn.length); i++) {
                    mm.addNode(root, '<div class="syn">' + syn[i] + '</div>', {});
                }

                var superclass = data.superclass;
                var super_name = data.superclass_text == undefined ? "" : data.superclass_text;
                mm.addNode(root, '<div class="super">' + superclass + '<br />' + super_name + '</div>', {});

                var drgs = data.drgs;
                for (var i = 0; i < Math.min(MAX_DRGS, drgs.length); i++) {
                    mm.addNode(root, '<div class="drg">' + drgs[i] + '</div>', {});
                }

                var exclusiva = data.exclusiva;
                for (var i = 0; i < Math.min(MAX_EXCLUSIVA, exclusiva.length); i++) {
                    mm.addNode(root, '<div class="exclusiva">' + exclusiva[i] + '</div>', {});
                }

                var inclusiva = data.inclusiva;
                for (var i = 0; i < Math.min(MAX_INCLUSIVA, inclusiva.length); i++) {
                    mm.addNode(root, '<div class="inclusiva">' + inclusiva[i] + '</div>', {});
                }

                var fields = response.fields;
                for (var i = 0; i < Math.min(MAX_FIELDS, fields.length); i++) {
                    var f = fields[i].field;
                    var n = fields[i].name;
                    var r = fields[i].relatedness;
                    var c = Math.floor((r*156)+100).toString(16); //The more related the brighter
                    var color = '#' + c + c + c; //Color is three times c, so it's always grey
                    mm.addNode(root, '<div class="cat" style="background-color:' + color +'">' + f + ': ' + n + '</div>', {});
                }
            },
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    },

    getDoctors: function (input) {
        // TODO
    },

    getSpeciality: function (input) {
        // TODO
    }
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}