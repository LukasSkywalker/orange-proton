var generic = {
  // Read a page's GET URL variables and return them as an associative array.
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

  // detect SVG support, by Modernizr
  supportsSVG: function() {
    return !! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect;
  },

  // check for console.log because IE does not implement it
  log: function (text) {
    // IE does not know the console object
    if (window.console) {
      console.log(text);
    }
  }
}
