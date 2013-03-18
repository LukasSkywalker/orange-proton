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
    if(code==32||code==13||code==188||code==186){
        sendRequest($(this).val());
    }
  });
});

//This Script sends ajax json requests to the database
function sendRequest(input){
  console.log(input);
  getICD(input);
  // TODO getSpeciality(input);
  // TODO getDoctors(input);
}

function getICD( input ){
  jQuery.ajax({
    url: '/api/v1/fields/get?code='+input+'&count=4&lang=de',
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
      for( var i=0; i<Math.min(5, syn.length); i++) {
        mm.addNode(root, '<div class="syn">'+syn[i]+'</div>', {});
      }

      var cat = data.superclass;
      mm.addNode(root, '<div class="super">'+cat+'</div>', {});

      var drgs = data.drgs;
      for( var i=0; i<Math.min(5, drgs.length); i++) {
        mm.addNode(root, '<div class="drg">'+drgs[i]+'</div>', {});
      }

      var exclusiva = data.exclusiva;
      for( var i=0; i<Math.min(5, exclusiva.length); i++) {
        mm.addNode(root, '<div class="exclusiva">'+exclusiva[i]+'</div>', {});
      }

      var inclusiva = data.inclusiva;
      for( var i=0; i<Math.min(5, inclusiva.length); i++) {
        mm.addNode(root, '<div class="inclusiva">'+inclusiva[i]+'</div>', {});
      }

      var fields = response.fields;
      for(var i=0; i<fields.length; i++){
        var f = fields[i].field;
        var n = fields[i].name;
        var r = fields[i].relatedness;
        mm.addNode(root, '<div class="cat">'+f+': '+n+'('+f+')</div>', {});
      }
    },
    error: function(xhr, status, error){
      alert(error);
    }
  });
}

function getDoctors( input ){
  // TODO
}

function getSpeciality( input ){
  // TODO
}
