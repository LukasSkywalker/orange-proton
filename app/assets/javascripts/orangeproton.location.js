/**
 * All location and geolocation-related methods and things
 * @class orangeproton.location
 */
"use strict";
var orangeproton = orangeproton || {};
orangeproton.location = {
  userLocation: null,
  geoLocation: {
    lat: 46.951288,
    lng: 7.438774
  },

  /**
   * Geolocates the user based on the IP via http://freegeoip.net
   * @param {Function} successHandler A callback function for a successful request
   * @param {Function} successHandler.lat The requesters latitude
   * @param {Function} successHandler.lng The requesters longitude
   * @param {Function} successHandler.country The requesters country name
   * @param {Function} successHandler.city The requesters city name
   * request, see http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
   */
  getGeoIp: function( successHandler) {
    var url = 'http://freegeoip.net/json/';
    jQuery.ajax({
      url: url,
      dataType: 'jsonp',
      success: function( response ) {
        var lat = response.latitude;
        var lng = response.longitude;
        var country = response.country_name;
        var city = response.city;
        successHandler(lat, lng, country, city);
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
        if (status === 'OK') {
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
      region: 'ch',
      callback: function(results, status) {
        if (status === 'OK') {
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
    return orangeproton.location.userLocation ? orangeproton.location.userLocation : orangeproton.location.geoLocation;
  },

  /**
   * Sets a new user-defined location. This will be favoured over
   * the #setLocation value.
   * @param {Number} lat the new latitude
   * @param {Number} lng the new longitude
   */
  setUserLocation: function( lat, lng ) {
    orangeproton.location.userLocation = {lat: lat, lng: lng};
    $(document).trigger('locationChange', [lat, lng]);
    $.cookie('userLocation', lat + ',' + lng);
  },

  /**
   * Sets a new auto-calculated location. This will be overwritten by values set
   * with #setUserLocation.
   * @param {Number} lat the new latitude
   * @param {Number} lng the new longitude
   */
  setLocation: function( lat, lng ) {
    orangeproton.location.geoLocation = {lat: lat, lng: lng};
    $(document).trigger('locationChange', [lat, lng]);
    $.cookie('geoLocation', lat + ',' + lng);
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
    orangeproton.location.geoCode(address, function onGeocodeComplete(lat, lng) {
      orangeproton.location.setUserLocation(lat, lng);
      var map = $('#location-map').data('map');
      map.removeMarkers();
      map.setCenter(lat, lng);
      map.addMarker(orangeproton.location.markerOptions(lat, lng));
    });
  },

  /**
   * Show the location-display and location-selection dialog.
   */
  showMap: function() {
    var $popup = $('<div id="location-popup"></div>');
    var $search = $('<input type="text" id="location-input"/>');
    var $searchButton = $('<input type="button" value="'+ I18n.t('search') +'"/>');
    var $resetButton = $('<input type="button" class="right" value="'+ I18n.t('reset') +'"/>');
    var $setButton = $('<input type="button" class="right" value="'+ I18n.t('save') +'"/>');
    var $currentLocation = $('<p></p>').addClass('location');

    $search.enterHandler(function() {
      orangeproton.location.geoCodeAndMark($('#location-input').val());
    });

    $searchButton.on('click', null, function onSearchButtonClick() {
      orangeproton.location.geoCodeAndMark($('#location-input').val());
    });

    $resetButton.on('click', null, function onResetButtonClick() {
      orangeproton.location.userLocation = null;
      $.removeCookie('userLocation');
      $(document).trigger('locationChange');
      var map = $('#location-map').data('map');
      var location = orangeproton.location.getLocation();
      map.removeMarkers();
      map.addMarker(orangeproton.location.markerOptions(location.lat, location.lng));
      map.setCenter(location.lat, location.lng);
    });

    $setButton.on('click', null, function onSetButtonClick() {
      $.fancybox.close();
    });

    var $map = $('<div id="location-map"></div>').width(800).height(500);

    $popup.append('<h3>'+ I18n.t('position') +'</h3>').append($search).append($searchButton).append($resetButton).append($setButton)
        .append($currentLocation).append($map).appendTo('body');

    //$map.css({width: '100%', height: '100%', position: 'relative'});

    var location = orangeproton.location.getLocation();
    var map = new GMaps({
      div: '#location-map',
      lat: location.lat,
      lng: location.lng
    });
    map.addMarker(orangeproton.location.markerOptions(location.lat, location.lng));

    $('#location-map').data('map', map);

    $.fancybox($popup, {
      afterShow: function () {
        $.fancybox.update();
        $(document).trigger('locationChange');
      },
      beforeClose: function() { $('#location-popup').remove(); }
    });
  },

  /**
   * Start position detection with native implementation (navigator.geolocation)
   * #getGeoIp is used as fallback when an error occurs or native geolocation is
   * unsupported
   */
  startGeoLocation: function() {
    if( orangeproton.location.loadCookies() ) {
      return;
    }
    // we had cookies, no need to bother the user with location permission requests
    function fallbackGeoIp() {
      orangeproton.location.getGeoIp(function (lat, lng){
        orangeproton.location.setLocation(lat, lng);
      });
    }

    if ('geolocation' in navigator) {
      var lat = orangeproton.location.getLocation().lat;
      var lng = orangeproton.location.getLocation().lng;
      navigator.geolocation.getCurrentPosition(function success(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }, function error(error_msg) {
        alert(error_msg.message);
        fallbackGeoIp();
      });
      orangeproton.location.setLocation(lat, lng);
    } else {
      fallbackGeoIp();
    }
  },

  /**
   * Load the location cookies and store their value
   * @returns {Boolean} whether the cookies existed
   */
  loadCookies: function() {
    var userLocation = $.cookie('userLocation');
    var geoLocation = $.cookie('geoLocation');
    if(userLocation) {
      var userCoord = userLocation.split(',');
      orangeproton.location.setUserLocation(userCoord[0], userCoord[1]);
    }
    if(geoLocation) {
      var geoCoord = geoLocation.split(',');
      orangeproton.location.setLocation(geoCoord[0], geoCoord[1]);
    }
    return (geoLocation || userLocation);
  }

};
