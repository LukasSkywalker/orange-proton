// This file handes search requests. It makes the AJAX-request and parses and displays the result.
// TODO:
// -the input field is locked after the first search (element floating above it or mindmap.js capturing onclicks?)
// -define action when clicking a node
// -use language defined in ui, not default (de)
// -namespace the whole file so we don't pollute 'window' too much
// -rethink the for-loops. maybe we could simplify them
// -when performing a search, a black line quickly appears from the top left corner to the center of the screen. Has probably something to do with .mindmap()-ing the <body> element, although this is equal to the example implementation.

$(document).ready(function(){
  $("#code-name").keyup(function(e) {
    var code = e.which; // normalized across browsers, use this :-)
    if(code==13) e.preventDefault();
    if(code==32||code==13||code==188||code==186){  // 32 = space, 13 = enter, 188 = comma, 186 = semi-colon
        mindmapper.sendRequest($(this).val().toUpperCase());
    }
  });
});


var mindmapper = {
  //This method sends ajax requests to the API
  sendRequest: function( input ){
    console.log(input);
    this.getICD(input);
    // TODO mindmapper.getSpeciality(input);
    // TODO mindmapper.getDoctors(input);
  },

  getICD: function( input ){
    var MAX_SYN = 5; // max number of synonyms to display
    var MAX_FIELDS = 5; // max number of fields
    var MAX_DRGS = 5;
    var MAX_INCLUSIVA = 5;
    var MAX_EXCLUSIVA = 5;

    var lang = $("#lang").val();

    jQuery.ajax({
      url: '/api/v1/fields/get?code='+input+'&count=4&lang='+lang,
      type: 'GET',
      dataType: 'json',
      contentType: "charset=UTF-8",
      success : function(response, status) {
        // TODO: we should definitely change the removal routines here. This is US-style. kill everything that moves.
        // look at mindmap.js's source and try to find the "nodes" array in the window object to remove nodes and stuff from there.
        $(".node").remove();
        $("svg").remove();
        $("path").remove();
        
        $('body').mindmap();
        var data = response.data; // text is already parsed by JQuery
        var mm = $('body');

        var name = data.text;

        var root = $('body').addRootNode(input + "</br>" +name, {}); // define a root node to attach the other nodes to
        
        var syn = data.synonyms;      
        for( var i=0; i<Math.min(MAX_SYN, syn.length); i++) {
          mm.addNode(root, '<div class="syn">'+syn[i]+'</div>', {});
        }

        var superclass = data.superclass;
        var super_name = data.superclass_text;
        mm.addNode(root, '<div class="super">'+superclass+'</br>'+ super_name +'</div>', {});

        var drgs = data.drgs;
        for( var i=0; i<Math.min(MAX_DRGS, drgs.length); i++) {
          mm.addNode(root, '<div class="drg">'+drgs[i]+'</div>', {});
        }

        var exclusiva = data.exclusiva;
        for( var i=0; i<Math.min(MAX_EXCLUSIVA, exclusiva.length); i++) {
          mm.addNode(root, '<div class="exclusiva">'+exclusiva[i]+'</div>', {});
        }

        var inclusiva = data.inclusiva;
        for( var i=0; i<Math.min(MAX_INCLUSIVA, inclusiva.length); i++) {
          mm.addNode(root, '<div class="inclusiva">'+inclusiva[i]+'</div>', {});
        }

        var fields = response.fields;
        for(var i=0; i<Math.min(MAX_FIELDS,fields.length); i++){
          var f = fields[i].field;
          var n = fields[i].name;
          var r = fields[i].relatedness;
          mm.addNode(root, '<div class="cat">'+f+': '+n+'</div>', {});
        }
      },
      error: function(xhr, status, error){
        alert(error);
      }
    });
  },

  getDoctors: function( input ){
    // TODO
  },

  getSpeciality: function( input ){
    // TODO
  }
}
