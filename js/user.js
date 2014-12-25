define([
  'jquery',
  'js/geolocation'
], function($, GeoLocation){
  function User() {
    this.location_service = new GeoLocation();
    this.location = {};
  }

  User.prototype.loadGeoLocation = function() {
    var self = this;
    var location_data = {};
    this.location_service.acquireNavigatorLocation(function(response) {
      if (response.hasOwnProperty('error')) {
        return self.presentUserForAddress(response['error']);
      } else {
        self.location = response;
        window.NotificationCenter.emit('location_ready')
        return true;
      }
    });
  }

  User.prototype.presentUserForAddress = function(response){
    var self = this;
    var addess = prompt(response + ' Please enter your address:',
                        '490 2nd St #101, San Francisco, CA 94107');

    if (addess != null) {
      var location_data = {};
      var moo = self.location_service.getAddressLocation(addess, function(response) {
        if (response.hasOwnProperty('error')) {
          alert(response.lastResponse['error']);
          window.NotificationCenter.emit('location_failure')
        } else {
          self.location = response;
          window.NotificationCenter.emit('location_ready')
        }
      })
    } else {
      window.NotificationCenter.emit('location_failure')
    }
  }

  return User;
});
