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
          .attr('title', I18n.t(className));
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
    var rangePattern = new RegExp('\{'+icdPattern.source+'-'+icdPattern.source+'\}', 'gi'); // match 'B20' and 'B21' of '{B20-B21}'
    var subRangePattern = new RegExp('\{'+icdPattern.source+'\.-\}', 'ig'); // match 'B20' of '{B20.-}'
    var multiNodePattern = new RegExp('\{'+icdPattern.source+'\}', 'ig');
    var additionalNodes = [];
    $.each(collection, function(i, e) {
      var content = contentPattern.exec(e);
      var text;
      if(content) text = content[1];
      else text = e;
      var rangeMatch;
      while( rangeMatch = rangePattern.exec(e)) {
        var num1 = rangeMatch[1].substr(1);
        var num2 = rangeMatch[3].substr(1);
        var letter = rangeMatch[1].substr(0,1);
        for(var i = num1; i <= num2; i++) {
          var node = text + ' {' + letter + i + '}';
          additionalNodes.push(node);
        }
      }
      var subRangeMatch;
      while( subRangeMatch = subRangePattern.exec(e)) {
        var node = text + ' {' + subRangeMatch[1] + '}';
        additionalNodes.push(node);
      }
      var multiNodeMatch;
      while( multiNodeMatch = multiNodePattern.exec(e)) {
        var node = text + ' {' + multiNodeMatch[1] + '}';
        additionalNodes.push(node);
      }
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
      height: $(window).height() - $("#search-bar").outerHeight()
    });
  }
};
