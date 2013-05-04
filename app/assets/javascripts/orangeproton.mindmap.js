/**
 * All mindmap-preprocessing and -drawing related methods
 * @class orangeproton.mindmap
 */
var orangeproton = orangeproton || {};
orangeproton.mindmap = {
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
  generateBubbles: function (contents, limit, className, pattern, data, click) {
    var bubbles = [];
    if (!contents) return bubbles;
    contents = contents.slice(0, limit); // set collection size limit
    $.each(contents, function (index, text) {
      var $element = $('<div></div>')
          .addClass(className)
          .html(text.replace(/(.*) \{(.*)\}/i, '$2<br />$1'))// make asdf {b} become b<br />asdf
          .hoverIntent(function (){
              var type;
              if(className==='inclusiva' || className==='exclusiva'){
                 type = 'inclusiva-exclusiva';
              }
              else {
                  type=className;
              }
              toggleHighlightContainer(type);
          }, null);
      if (pattern) {
        var result = text.match(pattern);
        if (result) {
          if (click) {        //onclick handler was supplied
            $element.on('click', {data: data, match: result}, function (e) {
              console.log('click1');
              click(e.data.data, e.data.match);
            });
          } else {            //inject the default click handler
            $element.on('click', {match: result}, function (e) {
              var code = decodeURI(e.data.match[0]);
              code = code.replace('<', '').replace('{', '').replace('}', ''); //bad fix for a bad regex
              $(document).trigger('paramChange', [code, null]);
              $('#mindmap').megamind('setRoot', this, true);
              orangeproton.trail.push(className, code);
            });
          }
          $element.addClass('clickable');
        } else {
          //regex does not match
        }
      }
      bubbles.push($element);
    });
    return bubbles;
  },

  /**
   * Parse ICD-codes included in the text like {B20.-}, {B30-B32} and {B40}, {B42}
   * and return the new nodes (would be B20, B30, B31, B32, B42, B42)
   * @param {String[]} collection content to parse
   * @returns {String[]} the new contents
   */
  preprocessNodes: function(collection) {
    if( collection === undefined ) return [];
    var icdPattern = /(.[0-9]{2}(\.[0-9]{1,2})?)/;
    var contentPattern = /^(.*?)\s\{/;    // match 'Bla' of 'Bla {B20}'
    var subRangePattern = new RegExp('\{'+icdPattern.source+'\.-\}', 'ig'); // match 'B20' of '{B20.-}'
    var multiNodePattern = new RegExp('\{'+icdPattern.source+'\}', 'ig');
    var additionalNodes = [];
    $.each(collection, function(i, e) {
      var content = contentPattern.exec(e);
      var text;
      if(content) text = content[1];
      else text = e;
      var subRangeMatch;
      var matchCount = 0;
      while( subRangeMatch = subRangePattern.exec(e)) {
        var node = text + ' {' + subRangeMatch[1] + '}';
        additionalNodes.push(node);
        matchCount++;
      }
      var multiNodeMatch;
      while( multiNodeMatch = multiNodePattern.exec(e)) {
        var node = text + ' {' + multiNodeMatch[1] + '}';
        additionalNodes.push(node);
        matchCount++;
      }
      if(matchCount === 0)
        additionalNodes.push(e);
    });
    return additionalNodes;
  },

  /**
   * resize the mindmap container based on window, legend and searchbar-size
   */
  resizeMindmap: function() {
    var panelHidden = mindmapper.panelHidden();
    var otherWidth = panelHidden ? 20 : $("#panels").outerWidth() + 20;
    var windowWidth = window.innerWidth || document.body.offsetWidth || document.documentElement.offsetWidth;
    $("#mindmap").css({
      width: windowWidth - otherWidth- $("#hide-panels").width(),
      height: $(window).height() - $("#search-bar").outerHeight() - $('#breadcrumb').outerHeight()- 9
    });
  },

  draw: function(response, input, mode) {
    var $mm = $('#mindmap');
    var options = orangeproton.options.display;
    $mm.megamind('cleanUp');

    var status = response.status;
    if (status === 'error') {
      var message = response.message;
      $.notify.error(message, { occupySpace : true ,close : true});
      return;
    }

    var data = response.result.data; // text is already parsed by JQuery

    var name = data.text;
    var container = $mm.megamind();      //initialize
    name = name.replace(/\{(.*?)\}/gi, '{<a href="#" onclick="event.preventDefault(); $(document).trigger(\'paramChange\', [\'$1\']);">$1</a>}');
    var rootNode = $('<div class="root"><p>{0}</br>{1}</p></div>'.format(input, name)).hoverIntent(function(){
      clearHighlight();
    }, null);

    //Add handler to clear Highlight

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
      synonyms = orangeproton.mindmap.generateBubbles(data.synonyms, options.max_syn, 'syn');
    }
    var c = $mm.megamind('addCanvas', ['bottomRight'], 'syn');
    c.addNodes(synonyms);

    var superclasses = [];
    if (data.superclass) {
      var patternNoDash = /^(.[0-9]{2}(\.[0-9]{1,2})?)</gi;  //matches a single ICD before a HTML-tag start
      var content = '{0}<br />{1}'.format(data.superclass, data.superclass_text || '');
      superclasses = orangeproton.mindmap.generateBubbles([content], 1, 'super', patternNoDash);
    }
    var c = $mm.megamind('addCanvas', ['topRight'], 'super');
    c.addNodes(superclasses);

    var subclasses = orangeproton.mindmap.generateBubbles(data.subclasses, options.max_sub, 'sub', /(.*)/gi);
    var c = $mm.megamind('addCanvas', ['right'], 'sub', {shuffle: false});
    c.addNodes(subclasses);

    //mode setting
    if(mode == 'ad'){
      var drgs = orangeproton.mindmap.generateBubbles(data.drgs, orangeproton.options.display.max_drgs, 'drg');
      var c = $mm.megamind('addCanvas', ['top'], 'drg', {shuffle: false});
      c.addNodes(drgs);

      var exc = orangeproton.mindmap.preprocessNodes(data.exclusiva);
      var icdPattern = /\{(.[0-9]{2}(\.[0-9]{1,2})?)\}$/gi;
      var exclusiva = orangeproton.mindmap.generateBubbles(exc, 10, 'exclusiva', icdPattern);

      var inc = orangeproton.mindmap.preprocessNodes(data.inclusiva);
      var inclusiva = orangeproton.mindmap.generateBubbles(inc, options.max_inclusiva, 'inclusiva', icdPattern);
      var c = $mm.megamind('addCanvas', ['bottom'], 'inclusiva-exclusiva');
      c.addNodes(exclusiva.concat(inclusiva));
    }

    var s = [];
    var fields = response.result.fields;
    fields.sortBy('relatedness');
    fields.reverse();
    for (var i = 0; i < Math.min(options.max_fields, fields.length); i++) {
      var f = fields[i].field;
      var n = fields[i].name;
      var r = fields[i].relatedness;
      var newdiv = $('<div class="field clickable"><div class="content">' + f + ':' + n +
          '<div class="relatedness-container">' +
          '<div class="relatedness-display" style="width:' + r * 100 + '%;" title=" Relevanz ' + Math.round(r * 100) + '%"></div>' +
          '</div></div>' +
          '<p class="icon-user-md"></p>' +
          '</div>');
      newdiv.on('click', { field: f }, function (e) {
        $(this).spin(orangeproton.options.libraries.docSpinner);
        var lat = orangeproton.location.getLocation().lat;
        var lng = orangeproton.location.getLocation().lng;
        orangeproton.doctor.getDoctors(e.data.field, lang, lat, lng);
      });
      s.push(newdiv);

      //add hover event to every field node
      $(newdiv).hoverIntent(function (){
        toggleHighlightContainer('field');
      },null);
    }


    var c = $mm.megamind('addCanvas', ['topLeft', 'left', 'bottomLeft'], 'field', {shuffle: false});
    c.addNodes(s);
    mindmapper.hideSpinner();
    $('.syn.node').hoverIntent(function (){
      toggleHighlightContainer('syn');
    }, null);

    $(".icon-user-md").each(function(){
      $(this).css({"line-height": $(this).parent().height()+'px'});
    });

    var $trail = $('#bread-crumbs');
    $trail.html(orangeproton.trail.getList());
    $(".tipsy").remove();
    $('#bread-crumbs [title]').tipsy({
      trigger: 'hover',
      gravity: 's',
      delayIn: '100',
      delayOut: '0',
      fade: 'true'
    });

    if(response.result.is_fallback){
      $.notify.alert("Fallback language", { occupySpace : true ,close : true, autoClose : 3000}); //TODO I18n this
    }
  }
};
