//This Script sends ajax json requests to the database
function sendRequest(){
  //TODO Count und lang aus UI ablesen?
  var input = document.getElementById("code-name").value;
  console.log(input);
  getICD(input);
  //getSpeciality(input);
  //getDoctors(input);
}

function getICD( input ){
  jQuery.ajax({
    url: '/api/v1/fields/get?code='+input+'&count=1&lang=de',
    type: 'GET',
    dataType: 'json',
    contentType: "charset=UTF-8",
    success : function(text) {
      $('body').mindmap();
      console.log(text);
      var root = $('body').addRootNode($("#code-name").val()+"<br />"+text.data.text , {});
      var data = text.data;
      var syn = data.synonyms;
      for( var i=0; i<Math.min(5, syn.length); i++) {
        $('body').addNode(root, '<div class="syn">'+syn[i]+'</div>', {});
      }
      var cat = data.superclass;
      $('body').addNode(root, '<div class="cat">'+cat+'</div>', {});
      var drgs = data.drgs;
      for( var i=0; i<Math.min(5, drgs.length); i++) {
        $('body').addNode(root, '<div class="drg">'+drgs[i]+'</div>', {});
      }
      var exclusiva = data.exclusiva;
      for( var i=0; i<Math.min(5, exclusiva.length); i++) {
        $('body').addNode(root, '<div class="exclusiva">'+exclusiva[i]+'</div>', {});
      }
      var inclusiva = data.inclusiva;
      for( var i=0; i<Math.min(5, inclusiva.length); i++) {
        $('body').addNode(root, '<div class="inclusiva">'+inclusiva[i]+'</div>', {});
      }
      var fields = text.fields;
      for(var i=0; i<fields.length; i++){
        var f = fields[i].field;
        var n = fields[i].name;
        var r = fields[i].relatedness;
        $('body').addNode(root, '<div class="cat">'+f+': '+n+'</div>', {});
      }
    }
  });
}

function getDoctors( input ){
  // todo
}

function getSpeciality( input ){
  // todo
}
