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
            url: op.apiBase + '/docs/get?lat={0}&long={1}&field={2}&count={3}'.format(lat, lng, field, count),
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
        var $docList = $('<div id="docList"></div>');
        var $map = $('<div id="map"></div>');
        var $mapFrame = $('<div id="map-frame"></div>');
        var $help = $('<div id="map-help"><h2>'+ I18n.t('doc_help')+'</h2></div> ');
        $map.append($mapFrame);
        $overlay.append($docList).append($map).append('<div style="clear:both;"></div>').appendTo('body');
        $overlay.prepend($help);

        var map = new GMaps({
            div: '#map-frame',
            lat: orangeproton.location.getLocation().lat,
            lng: orangeproton.location.getLocation().lng
        });
        map.addMarker({
            lat: orangeproton.location.getLocation().lat,
            lng: orangeproton.location.getLocation().lng
        });
        $('#map-frame').data('map', map);

        var docs = response.result;
        for (var i = 0; i < docs.length; i++) {
            var doc = docs[i];
            var title = doc.title;
            var name = doc.name;
            var lat = doc.lat;
            var lng = doc.long;
            var address = doc.address.replace(/,\s*/gi, "<br />");
            var element =
                '<input id="docItem-{0}" class="docItem" type="radio" name="doctors">'
                    + '<label class="docLabel clickable" for="docItem-{0}" >'
                    + '  <p class="doc doc-title">{1}</p>'
                    + '  <p class="doc address">{2}<br />{3}</p>'
                    + '</label>'
                    + '</input>';
            map.addMarker({
                lat: lat,
                lng: lng,
                infoWindow: {
                    content: '<div style="max-width: 200px;">' + title + '<br />' + name + '<br />' + address + '</div>'
                }
            });
            var $menuItem = $(element.format(i, title, name, address));

            $menuItem.on('change', {details: doc}, function doctorClick(e) {
                $('#map-frame').data('map').setCenter(e.data.details.lat, e.data.details.long);
            });
            $docList.append($menuItem);
        }

        var opts = orangeproton.options.libraries.fancybox;
        $.fancybox($overlay[0], $.extend({}, opts, {
            afterShow: function () {
                $('#map-frame').css({height: '100%'});
            },
            beforeClose: function () {
                $('.docOverlay').remove();
            }}));
    }
};