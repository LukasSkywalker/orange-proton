/**
 * All adminpanel-related methods and requests
 * @class orangeproton.admin
 */
var orangeproton = orangeproton || {};
orangeproton.admin = {
  /**
   * Load and display weights sliders
   */
  loadPanel: function(){
      jQuery.ajax({
          url: op.apiBase + '/admin/weights/get',
          type: 'GET',
          datatype: 'json',
          contentType: "charset=UTF-8",
          success: orangeproton.admin.displaySliders
      });
  },

  /**
   * Send the current user-set weight-sliders and saves
   * the data on the server
   */
  sendWeights: function(){
      var params = [];
      var values = $('.admin-slider').each(function(i, e){
        params.push($(e).slider( 'value' ));
      });
      jQuery.ajax({
          url: op.apiBase + '/admin/weights/set?values=' + params,
          type: 'POST',
          success: orangeproton.admin.displaySliders
      });
  },

    /**
     * Displays the Adminpanel
     */
  displayPanel: function(){
      if($('#admin').length === 0){
          $('#bread-crumbs').after(
              $('<div id="hide-panels" class="clickable">' +
                  '<h3>?</h3>' +
                  '</div>' +
                  '<div id="panels-container">' +
                  '<div id="panels">' +
                  '<div id="admin" class="panel">' +
                  '<div id="admin-title" class="title">' +
                  '<p>Admin panel</p>' +
                  '</div>' +
                  '<div id="admin-text"></div>' +
                  '</div>' +
                  '</div>' +
                  '</div>')
          );
      }

  },

  /**
   * Display the sliders based on the response-array
   * @param {Array} response An array containing values for each weight slider
   * @param {String} status The HTTP-status code of the request
   */
  displaySliders: function(response, status) {
      if($('#admin').length === 0){
          orangeproton.admin.displayPanel();
      }

      var providers = ["MDC", "Range", "Thesaur", "StringMatcher", "Chop"];
      var panel = $("#admin-text");

      panel.empty();
      panel.append('<input type="button" onclick="orangeproton.admin.debugMindmap();" value="Debug Mindmap">');

      var values = response;
      $.each(providers, function(index, name) {
          panel.append($('<p/>').html(name).addClass('provider'));
          var slider = $('<p/>').addClass('admin-slider');
          slider.slider({animate:"fast", value:values[index], step:5});
          panel.append(slider);
      });
      panel.append('<input type="button" onclick="orangeproton.admin.sendWeights();" value="Apply">');
      panel.append('<input type="button" style="float:right" onclick="orangeproton.admin.resetWeights();" value="Reset">');
      $(document).trigger('paramChange', [null, null, true]);
  },

  /**
   * Reset the weights locally and remotely
   */
  resetWeights: function(){
      jQuery.ajax({
          url: op.apiBase + '/admin/weights/reset',
          type: 'POST',
          success: orangeproton.admin.displaySliders
      });
  },

  /**
   * Toggle debug elements for the current mindmap
   */
  debugMindmap: function() {
      $("#mindmap").megamind('debug');
  }
};
