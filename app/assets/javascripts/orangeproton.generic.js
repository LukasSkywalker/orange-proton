/**
 * All generic methods not tied to our project
 * @class orangeproton.generic
 */
var orangeproton = orangeproton || {};
orangeproton.generic = {  // Read a page's GET URL variables and return them as an associative array.
  /**
   * Parse the url and return an associative array of the parameter names and values
   * @returns {Array} associative array a[key] = value
   */
  getUrlVars: function() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },

  /**
   * Check for SVG-support
   * @returns {boolean} if SVG is supported
   */
  supportsSVG: function() {
    return !! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect;
  },

  /**
   * Log a message to the console if available. IE<7 and IE where devtools are not
   * open do not support this.
   * @param {String} text the message to log
   */
  log: function (text) {
    // IE does not know the console object
    if (window.console) {
      console.log(text);
    }
  },

  /**
   * Show a styled messagebox.
   * @param {String} title message title
   * @param {String} content message content
   * @param {String[]} buttons labels of the buttons
   * @param {Function[]} actions the actions for the buttons
   * @param {Number} [focusIndex=0] the index of the focused button
   */
  messageBox: function(title, content, buttons, actions, focusIndex) {
    var $inputBox = $('<div class="messagebox"><h3>'+title+'</h3><p>'+content+'</p></div>');
    var $buttonContainer = $('<div class="messagebox-buttons"></div>');
    $inputBox.append($buttonContainer);
    focusIndex = focusIndex || 0;
    for(var i=0; i<buttons.length; i++){
      var text = buttons[i];
      var action = actions[i];
      var button = $('<input type="button" value="'+text+'">');
      button.on('click', null, action);
      $inputBox.children('.messagebox-buttons').first().append(button);
    }
    jQuery.fancybox({'modal' : true, 'content' : $inputBox});
    $buttonContainer.children()[focusIndex].focus();
  }
};
