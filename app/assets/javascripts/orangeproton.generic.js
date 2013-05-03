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
   * Inject console.log if not available. IE<7 and IE where devtools are not
   * opened need this fallback.
   */
  injectConsoleLog: function () {
    if ( !window.console ) {
      window.console = { log: function() {} };
    }
  }
};

$.fn.enterHandler = function( callback ) {
  this.keyup(function (e) {
    var code = e.which; // normalized across browsers, use this :-)
    if (code == 13) {
      e.preventDefault();
      callback(e);
    }
  });
};
