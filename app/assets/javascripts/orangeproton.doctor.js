/**
 * All doctor-related methods and requests
 * @class orangeproton.doctor
 */
var orangeproton = orangeproton || {};
orangeproton.doctor = {
  /**
   * Fetch and display the doctors from the db specific to the field and the users location
   * @param {Number} field number of the speciality
   * @param {String} lang search language
   * @param {Number} lat user's latitude
   * @param {Number} lng user's longitude
   */
  getDoctors: function (field, lang, lat, lng) {
    $('.docOverlay').remove();  //delete previously loaded stuff
    var count = orangeproton.options.display.max_docs;

    jQuery.ajax({
      url: '/api/v1/docs/get?lat={0}&long={1}&field={2}&count={3}'.format(lat, lng, field, count),
      type: 'GET',
      dataType: 'json',
      contentType: "charset=UTF-8",
      success: orangeproton.doctor.getDoctorsSuccessHandler,

      error: mindmapper.handleApiError,

      complete: mindmapper.hideSpinner
    });
  },
  /**
   * Callback for a successful doctor search. Displays the doctor overlay.
   * @param {Object} response the response object
   */
  getDoctorsSuccessHandler: function (response) {
    $('.docOverlay').remove();  //delete previously loaded stuff
    var status = response.status;
    if (status === 'error') {
      var message = response.message;
      alert(message);
      return;
    }

    var $overlay = $('<div class="docOverlay"></div>');
    var $docList = $('<div id="docList"><ul></ul></div>');
    var $map = $('<div id="map"></div>');
    var $mapFrame = $('<iframe id="map-frame"></div>');
    $map.append($mapFrame);
    $overlay.append($docList).append($map).append('<div style="clear:both;"></div>');
    var docs = response.result;
    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      var title = doc.title;
      var name = doc.name;
      var address = doc.address.replace(/,\s*/gi, "<br />");
      var url = 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl={0}' +
          '&q={1}&t=h&z=17&output=embed'
              .format(lang, encodeURIComponent(doc.name + ', ' + doc.address + ', Schweiz'));
      var element =
          '<input id="docItem-{0}" class="docItem" type="radio" name="doctors">'
              + '<label class="docLabel" for="docItem-{0}" >'
              + '  <p class="doc doc-title">{1}</p>'
              + '  <p class="doc address">{2}<br />{3}</p>'
              + '</label>'
              + '</input>';
      var $menuItem = $(element.format(i, title, name, address));

      $menuItem.on('change', {url: url, details: doc}, function doctorClick(e) {
        $('#map-frame').first().attr('src', e.data.url);
      });
      $docList.append($menuItem);
    }

    $.fancybox($overlay[0], orangeproton.options.libraries.fancybox);

    //Show First your current Location
    $('#map-frame').first().attr('src', 'http://maps.google.com/maps?f=q&iwloc=A&source=s_q&hl={0}' +
        '&q={1}&t=h&z=17&output=embed'
            .format(lang, encodeURIComponent(orangeproton.location.getLocation().lat + "," + orangeproton.location.getLocation().lng)));
  }
};