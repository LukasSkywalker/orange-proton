/**
 * All doctor-related methods and requests
 * @class orangeproton.doctor
 */
var orangeproton = orangeproton || {};
orangeproton.doctor = {

    setFallbacks: function(fallbacks) {
        orangeproton.doctor.fallbacks = fallbacks.slice(0).reverse(true);
    },

    /**
     * Fetch and display the doctors from the db specific to the field and the users location
     * @param {Number} field number of the speciality
     * @param {String} lang search language
     * @param {Number} lat user's latitude
     * @param {Number} lng user's longitude
     */
    getDoctors: function (field, lang, lat, lng) {
        var count = orangeproton.options.display.max_docs;

        jQuery.ajax({
            url: op.apiBase + '/docs/get?lat={0}&long={1}&field={2}&count={3}'.format(lat, lng, field, count),
            type: 'GET',
            dataType: 'json',
            contentType: "charset=UTF-8",
            success: function(response) {
                orangeproton.doctor.getDoctorsSuccessHandler(response, lang, field);
            },
            error: mindmapper.handleApiError,
            complete: mindmapper.hideSpinner
        });
    },
    /**
     * Callback for a successful doctor search. Displays the doctor overlay.
     * @param {Object} response response the response object
     * @param {String} language The language of the response
     * @param {Number} activeField the code of the active field
     */
    getDoctorsSuccessHandler: function (response, language, activeField) {
        $('#doc-overlay').remove();  //delete previously loaded stuff
        var status = response.status;

        if (status === 'error') {
            var message = response.message;
            $.notify.error(message, { occupySpace: true, close: true});
            return;
        }

        function drawContent() {
            var $overlay = $('#doc-overlay');
            var $fallbacks = $('<div id="fallbacks"></div>');
            var $container = $('<div id="doc-container"></div>');
            var $docList = $('<div id="doc-list"></div>');
            var $map = $('<div id="map"></div>');
            var $help =
                ($.browser.name === 'msie' && $.browser.version === '7.0')?   //Don't add center button in IE7
                    $('<div id="doc-header"><div id="doc-title">'+ I18n.t('info.doc_help')+'</div>' +
                        '</div> '):
                    $('<div id="doc-header"><div id="doc-title">'+ I18n.t('info.doc_help')+'</div>' +
                        '<div id="center-button" class=" icon-pushpin icon-2x clickable" title="' +I18n.t('action.center_map')+ '"></div>' +
                        '</div> ');

            $container.append($docList).append($map).append('<div style="clear:both;"></div>');
            $help.append($fallbacks);
            $overlay.append($help).append($container);

            var fieldFallbacks = orangeproton.doctor.fallbacks;

            var fbList = '<span>'+I18n.t('info.show_fallback')+':</span><br/><ul>';
            var loc = orangeproton.location.getLocation();

            for (var i = 0; i < fieldFallbacks.length; i++) {
                var fb = fieldFallbacks[i].name;
                var code = fieldFallbacks[i].code;

                fbList += '<li onclick="orangeproton.doctor.linkFmh({0}, \'{1}\', {2}, {3});">'.format(code, language, loc.lat, loc.lng);
                fbList += (activeField === code) ? '<b>{0}</b></li>'.format(fb) : '{0}</li>'.format(fb);

                if (i != fieldFallbacks.length - 1) {
                    fbList += '<i class="icon-caret-right"></i>'
                }
            }
            fbList += '</ul>';
            $('#fallbacks').html(fbList);

            $('#doc-header [title]').tipsy(orangeproton.options.libraries.tipsy);

            var map = new GMaps({
                div: '#map',
                lat: orangeproton.location.getLocation().lat,
                lng: orangeproton.location.getLocation().lng,
                width: 520,
                height: 400
            });

            var shadow = new google.maps.MarkerImage(
                'http://maps.google.com/mapfiles/ms/micons/msmarker.shadow.png',
                new google.maps.Size(59, 32),
                new google.maps.Point(0,0),
                new google.maps.Point(16, 32)
            );

            map.addMarker({
                lat: orangeproton.location.getLocation().lat,
                lng: orangeproton.location.getLocation().lng,
                icon: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
                shadow: shadow,
                infoWindow: { content: I18n.t('location') }
            });

            //Because IE7 messes this up, we don't show it there
			if (!($.browser.name === 'msie' && $.browser.version === '7.0')){
				//register center button
				$('#center-button').on('click', null, function () {
					 map.setCenter(orangeproton.location.getLocation().lat, orangeproton.location.getLocation().lng);
				});
			}

            $('#map').data('map', map);

            var userPos = new google.maps.LatLng( orangeproton.location.getLocation().lat, orangeproton.location.getLocation().lng );
            var bounds = new google.maps.LatLngBounds(userPos);

            var docs = response.result;

            // Assign numbers to doctors
            for (var i = 0; i < docs.length; i++) {
                docs[i].nr = i;
            }

            // Accumulate addresses
            var addresses = {};
            for (var i = 0; i < docs.length; i++) {
                doc = docs[i];

                if (addresses[doc.address] == null) {
                    addresses[doc.address] = [];
                }
                addresses[doc.address].push(doc.nr);
            }

            // Generate markers
            var markers = [];
            for (var address in addresses) {
                var nrs = addresses[address];

                // Accumulate titles and names into marker caption
                // Genrate marker label
                var markerLabel = '';
                var caption = '';
                for (var i = 0; i < nrs.length; i++) {
                    var doc = docs[nrs[i]];
                    markerLabel += nrs[i] + 1;
                    caption += '<i>{0}</i><br/><b>{1}</b>'.format(doc.title, doc.name);

                    if (i != nrs.length - 1) {
                        markerLabel += ',';
                        caption += ',<br /><br />';
                    }
                }
                caption += '<br />';

                markers.push({
                    caption: caption,
                    address: address,
                    label: markerLabel,
                    location: {
                        lat: docs[nrs[0]].lat,
                        lng: docs[nrs[0]].long
                    }
                })
            }

            // Add markers to map
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                map.addMarker({
                    lat: marker.location.lat,
                    lng: marker.location.lng,
                    icon: 'http://chart.apis.google.com/chart?chst=d_map_spin&chld=1.0|0|FF6363|13|b|' + marker.label,
                    shadow: shadow,
                    infoWindow: {
                        content: '<div style="max-width: 200px;">{0}<br />{1}</div>'.format(marker.caption, marker.address)
                    }
                });
            }

            // Add doctor menu entries
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                //Format Title
                var title = doc.title.replace(' für ',"<br> für ").replace(' e ',"<br> e ").replace(' en ',"<br> en ");
                var name = doc.name;
                var lat = doc.lat;
                var lng = doc.long;
                var address = doc.address.replace(/,\s*/gi, "<br />");
                var number = doc.nr + 1;
                var element =
                    '<div id="docItem-{0}" class="docItem">'
                        + '<label class="docLabel clickable" >'
                        + '  <p class="doc-number">'+ number +'</p>'
                        + '  <p class="doc doc-title"><i>{1}</i></p>'
                        + '  <p class="doc address"><b>{2}</b><br />{3}</p>'
                        + '</label>'
                        + '</div>';

                var $menuItem = $(element.format(i, title, name, address));

                $menuItem.on('click', {details: doc}, function doctorClick(e) {
                    var map = $('#map').data('map');
                    map.setCenter(e.data.details.lat, e.data.details.long);
                });
                $docList.append($menuItem);
                
                var pos = new google.maps.LatLng(lat, lng);
                bounds.extend(pos);
            }
            map.fitBounds(bounds);
        }

        var opts = orangeproton.options.libraries.fancybox;
        $.fancybox('<div id="doc-overlay"></div>', $.extend({}, opts, {
            afterShow: function () {
                drawContent();
            },
            beforeClose: function () {
                $('#doc-overlay').remove();
            },
            onUpdate: function(){
                $('#doc-container').height($('#doc-overlay').height() - $('#doc-header').outerHeight());
            }}));
    },

    linkFmh: function(code, lang, lat, lng) {
        $('#doc-overlay').spin(orangeproton.options.libraries.spinner);
        orangeproton.doctor.getDoctors(code, lang, lat, lng);
    }
};
