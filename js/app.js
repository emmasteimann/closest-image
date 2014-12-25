define([
  'jquery',
  'js/geolocation',
  'js/map_image'
], function($, GeoLocation, MapImage){

  function ClosestGuessGame() {
    this.nearby_locations = [];
    this.location_objects = [];
    this.closest_index = 9999;
    this.images_loaded = 0;
    this.image_failures = 0;
    this.service_state = "googlemaps"
  }

  ClosestGuessGame.prototype.initialize = function() {
    var self = this;
    window.User.loadGeoLocation();

    window.NotificationCenter.subscribe('location_ready', function(){
      self.locationReady();
    });

    window.NotificationCenter.subscribe('location_failure', function(){
      self.locationFailure();
    });

    window.NotificationCenter.subscribe('service_failure', function(){
      self.serviceFailure();
    });

    var game_ready_guid = window.NotificationCenter.subscribe('game_ready', function(){
      self.addEventListeners();
      window.NotificationCenter.unsubscribe('game_ready', game_ready_guid);
    });
  }

  ClosestGuessGame.prototype.locationReady = function() {
    this.loadNewLocations();
    this.createMapImages();
  };

  ClosestGuessGame.prototype.locationFailure = function() {
    alert('Unable to get your location. Please check your permissions and try again.');
  };

  ClosestGuessGame.prototype.serviceFailure = function() {
    alert('The service failed to load a full games worth of images. Its not as much fun with less than 5 images. Please try a reset or a nother service.');
  };

  ClosestGuessGame.prototype.addEventListeners = function() {
    var self = this;
    $("#reset_game").on( "click", function(){
      self.loadNewLocations();
      self.createMapImages();
    });
    $("#image_list").on( "click", "li", function(){
      item_id = $(this).attr("item_id")
      var distance = self.location_objects[item_id].distance;
      if (self.closest_index == $(this).attr("item_id")){
        alert("You win! That image was taken " + distance + " meters away from your location.");
        self.loadNewLocations();
        self.createMapImages();
      } else {
        alert("Guess again, that image was taken " + distance + " meters away from your location. there's still an image closer to you.")
      }
    });
    $("#service-toggle").on( "click", "a", function(e){
      e.preventDefault()
      var service_id = $(this).attr('id');
      self.service_state = service_id;
      self.loadNewLocations();
      self.createMapImages();
    });
  }

  ClosestGuessGame.prototype.createMapImages = function() {
    var self = this;
    this.location_objects = [];
    if (this.nearby_locations.length) {
      for (var i = 0; i < this.nearby_locations.length; i++) {
        var map_image = new MapImage();
        map_image.initialize(this.nearby_locations[i]);
        if (this.closest_index === 9999) {
          this.closest_index = i;
        } else if (map_image.distance < this.location_objects[this.closest_index].distance) {
          this.closest_index = i;
        }
        this.location_objects.push(map_image);

        if(self.service_state == "googlemaps") {
          insertImage(map_image.getDomElement(i, function(){
            self.images_loaded++;
            if (self.images_loaded === 5) {
              window.NotificationCenter.emit('game_ready')
            }
          }, function(){
            self.image_failures++;
          }));
        } else if (self.service_state == "instagram") {
          map_image.getInstagramDomElement(i, function(image_element){
            self.images_loaded++;
            insertImage(image_element)
            if (self.images_loaded === 5) {
              window.NotificationCenter.emit('game_ready')
            }
          }, function(){
            self.image_failures++;
          })
        } else {
          map_image.getFlickrDomElement(i, function(image_element){
            self.images_loaded++;
            insertImage(image_element)
            if (self.images_loaded === 5) {
              window.NotificationCenter.emit('game_ready')
            }
          }, function(){
            self.image_failures++;
          })
        }
        if (i === (this.nearby_locations.length - 1)){
          if(self.image_failures){
            window.NotificationCenter.emit('game_ready')
          }
        }
      }
      if (self.image_failures) {
        window.NotificationCenter.emit('service_failure')
      }
    }
  };

  function insertImage(domElement) {
    $("#image_list").append(domElement);
  }

  ClosestGuessGame.prototype.resetGame = function() {
    this.images_loaded = 0;
    this.image_failures = 0;
    this.closest_index = 9999;
    this.nearby_locations = [];
    this.location_objects = [];
    $("#image_list").empty();
  };

  ClosestGuessGame.prototype.loadNewLocations = function() {
    this.resetGame();
    var geo = new GeoLocation();
    longitude = window.User.location['longitude'];
    latitude = window.User.location['latitude'];
    for (var i = 0; i < 5; i++) {
      this.nearby_locations.push(geo.getRandomLocation(latitude, longitude));
    }
  };

  return ClosestGuessGame;
});
