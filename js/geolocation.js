define([
  'jquery',
], function($){

  function GeoLocation() {
    this.max_distance = 20000;
  }

  GeoLocation.prototype.acquireNavigatorLocation = function(responseHandler) {
    var self = this;
    if(navigator.geolocation) {
      var location_data = {};
      navigator.geolocation.getCurrentPosition(function(position) {
        responseHandler({'latitude': position.coords.latitude, 'longitude': position.coords.longitude})
      }, function() {
        responseHandler(noLocationHandler(true));
      });
    } else {
      responseHandler(noLocationHandler(false));
    }
  };

  function noLocationHandler(errorFlag) {
    if (errorFlag) {
      var error = 'Error: The Geolocation service failed.';
    } else {
      var error = 'Error: Browser doesn\'t support geolocation.';
    }
    return {'error': error}
  }

  GeoLocation.prototype.getAddressLocation = function(address, responseHandler) {
    var self = this;
    var geocoder = new google.maps.Geocoder();
    var response = '';
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        responseHandler({'latitude': results[0].geometry.location.lat(), 'longitude': results[0].geometry.location.lng()})
      } else {
        var error = 'Error: Geocode was not successful for the following reason: ' + status;
        responseHandler({'error': error})
      }
    });
  };

  GeoLocation.prototype.getRandomLocation = function(lat, lon){
    // Formula found here: http://stackoverflow.com/questions/2839533/adding-distance-to-a-gps-coordinate
    var random_distance = Math.floor(Math.random()*(this.max_distance-0+1)+0);
    var lat_new = lat + (180/Math.PI)*(random_distance/6378137)
    var lon_new = lon + (180/Math.PI)*(random_distance/6378137)/Math.cos(Math.PI/180.0*lat)
    return {'latitude': lat_new, 'longitude': lon_new, 'distance': random_distance}
  }

  return GeoLocation;
});
