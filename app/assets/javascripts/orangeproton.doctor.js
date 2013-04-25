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

        function drawContent() {
            var $overlay = $('.docOverlay');
            var $docList = $('<div id="docList"></div>');
            var $map = $('<div id="map"></div>');
            var $help = $('<div id="map-help"><h2>'+ I18n.t('doc_help')+'</h2></div> ');
            $overlay.append($docList).append($map).append('<div style="clear:both;"></div>');
            $overlay.prepend($help);

            var map = new GMaps({
                div: '#map',
                lat: orangeproton.location.getLocation().lat,
                lng: orangeproton.location.getLocation().lng
            });
            map.addMarker({
                lat: orangeproton.location.getLocation().lat,
                lng: orangeproton.location.getLocation().lng,
                icon: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
                infoWindow: { content: 'Ihr Standort' }
            });
            $('#map').data('map', map);
            
            var userPos = new google.maps.LatLng( orangeproton.location.getLocation().lat, orangeproton.location.getLocation().lng );
            var bounds = new google.maps.LatLngBounds(userPos);

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
                    var map = $('#map').data('map');
                    map.setCenter(e.data.details.lat, e.data.details.long);
                    google.maps.event.trigger(map, 'resize');

                    /*map.removeMarker($('#map').data('greenMarker'));

                    $('#map').data('greenMarker', map.addMarker({
                        lat: e.data.details.lat,
                        lng: e.data.details.long,
                        zIndex: google.maps.Marker.MAX_ZINDEX + 1,
                        icon: "http://maps.google.com/mapfiles/ms/micons/green-dot.png",
                        infoWindow: {
                            content: '<div style="max-width: 200px;">' + e.data.details.title + '<br />' + e.data.details.name + '<br />' + e.data.details.address + '</div>'
                        }
                    }));*/
                });
                $docList.append($menuItem);
                
                var pos = new google.maps.LatLng(lat, lng);
                bounds.extend(pos);
            }
            map.fitBounds(bounds);
        }

        var opts = orangeproton.options.libraries.fancybox;
        $.fancybox('<div class="docOverlay"></div>', $.extend({}, opts, {
            afterShow: function () {
                drawContent();
                //$('#map').css({height: '100%'});
                //google.maps.event.trigger($('#map').data('map'), 'resize');
            },
            beforeClose: function () {
                $('.docOverlay').remove();
            }}));
    }
};
