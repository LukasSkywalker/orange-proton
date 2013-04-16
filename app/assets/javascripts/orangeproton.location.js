/**
 * All location and geolocation-related methods and things
 * @class orangeproton.location
 */
var orangeproton = orangeproton || {};
orangeproton.location = {
  /**
   * Geolocates the user based on the IP via http://freegeoip.net
   * @param {Function} successHandler A callback function for a successful request
   * @param {Function} successHandler.lat The requesters latitude
   * @param {Function} successHandler.lng The requesters longitude
   * @param {Function} successHandler.country The requesters country name
   * @param {Function} successHandler.city The requesters city name
   * @param {Function} errorHandler A callback function for an unsuccessful
   * request, see http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
   */
  getGeoIp: function( successHandler, errorHandler ) {
    var url = 'http://freegeoip.net/json/';
    jQuery.ajax({
      url: url,
      type: 'GET',
      success: function( response, status ) {
        var lat = response.latitude;
        var lng = response.longitude;
        var country = response.country_name;
        var city = response.city;
        successHandler(lat, lng, country, city);
      },
      error: function( xhr, httpStatus, error ) {
        errorHandler(xhr, httpStatus, error);
      }
    });
  },

  /**
   * Geolocates the user based on the IP via http://ipinfodb.com
   * @param {Function} successHandler A callback function for a successful request
   * @param {Function} successHandler.lat The requesters latitude
   * @param {Function} successHandler.lng The requesters longitude
   * @param {Function} successHandler.country The requesters country name
   * @param {Function} successHandler.city The requesters city name
   * @param {Function} errorHandler A callback function for an unsuccessful
   * request, see http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
   */
  getIpInfo: function( successHandler, errorHandler ) {
    var url = "http://api.ipinfodb.com/v3/ip-city/?key="+ key +"&format=json";
    jQuery.ajax({
      url: url,
      type: 'GET',
      success: function( response, status ) {
        var lat = response.latitude;
        var lng = response.longitude;
        var country = response.countryName;
        var city = response.cityName;
        successHandler(lat, lng, country, city);
      },
      error: function( xhr, httpStatus, error ) {
        errorHandler(xhr, httpStatus, error);
      }
    });
  },

  /**
   * Geocode a street address
   * @param {String} address A street address to be geocoded
   * @param {Function} callback A callback when the geocoding is completed
   * @param {Function} callback.lat The geographical latitude
   * @param {Function} callback.lng The geographical longitude
   * @param {Function} callback.address Street address of the geocoding
   */
  geoCode: function(address, callback) {
    GMaps.geocode({
      address: address,
      callback: function(results, status) {
        if (status == 'OK') {
          var address = results[0].formatted_address;
          var latlng = results[0].geometry.location;
          callback(latlng.lat(), latlng.lng(), address);
        }
      }
    });
  },

  /**
   * Reverse-Geocode a geographical position
   * @param {Number} lat The latitude to be geocoded
   * @param {Number} lng The longitude to be geocoded
   * @param {Function} callback A callback when the geocoding is completed
   * @param {Function} callback.lat The geographical latitude
   * @param {Function} callback.lng The geographical longitude
   * @param {Function} callback.address Street address of the geocoding
   */
  reverseGeoCode: function(lat, lng, callback) {
    GMaps.geocode({
      lat: lat,
      lng: lng,
      callback: function(results, status) {
        if (status == 'OK') {
          var address = results[0].formatted_address;
          var latlng = results[0].geometry.location;
          callback(latlng.lat(), latlng.lng(), address);
        }
      }
    });
  },

  /**
   * Get the current location, favoring user-set over automatic
   * @returns {Object} the current location as {lat, lng}
   */
  getLocation: function() {
    return mindmapper.userLocation ? mindmapper.userLocation : mindmapper.geoLocation;
  },

  setUserLocation: function( lat, lng ) {
    mindmapper.userLocation = {lat: lat, lng: lng};
    $(document).trigger('locationChange', [lat, lng]);
  },

  setLocation: function( lat, lng ) {
    mindmapper.location = {lat: lat, lng: lng};
    $(document).trigger('locationChange', [lat, lng]);
  },

  displaySelectionPanel: function() {
    var $popup = $('<div id="location-popup"><input type="text" id="location-input"/>' +
        '<input type="button" value="Suche"/></div>');
  },

  markerOptions: function(lat, lng) {
    return {
      lat: lat,
      lng: lng,
      draggable: true,
      dragend: function (e) {
        var position = e.latLng;
        orangeproton.location.setUserLocation(position.lat(), position.lng());
      }
    };
  },

  geoCodeAndMark: function( address ) {
    orangeproton.location.geoCode(address, function onGeocodeComplete(lat, lng, address) {
      orangeproton.location.setUserLocation(lat, lng);
      var map = $('#location-map').data('map');
      map.removeMarkers();
      map.setCenter(lat, lng);
      map.addMarker(orangeproton.location.markerOptions(lat, lng));
    });
  }

};