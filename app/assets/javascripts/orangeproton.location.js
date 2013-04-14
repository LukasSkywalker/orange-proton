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

  /**
   * Geocodes and sets the user's location based on his address
   * @param {String} userInput the user's address
   */
  getUserLocation: function( userInput ) {
    function cb(lat, lng, address) {
      $('#location').html(address);
      mindmapper.userLocation = {lat: lat, lng: lng};
    }
    orangeproton.location.geoCode(userInput, cb)
  }
};