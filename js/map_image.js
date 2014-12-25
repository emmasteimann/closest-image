define([
  'jquery'
], function($){
  function MapImage() {
    this.latitude = 0;
    this.longitude = 0;
    this.distance = 0;
    this.base_url = "https://maps.googleapis.com/maps/api/staticmap?center={latitude},{longitude}&zoom=18&size=200x200&maptype=satellite"
    this.instagram_url = "https://api.instagram.com/v1/media/search?lat={latitude}&lng={longitude}&access_token=788880.d7b632a.293e89f2971d48fbb8a8e999b1a5cb7d"
    this.flickr_url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=9d9e41cedb443288362830352f9d28b0&lat={latitude}&lon={longitude}&per_page=30&page={page}&format=json&nojsoncallback=1&extras=url_q"
  }

  MapImage.prototype.initialize = function(opts) {
    if(typeof opts != 'object') return;
    if(opts.hasOwnProperty('latitude')
      && opts.hasOwnProperty('longitude')
      && opts.hasOwnProperty('distance')) {

      this.latitude = opts['latitude'];
      this.longitude = opts['longitude'];
      this.distance = opts['distance'];

    } else {
      throw('Not properly formated object.');
    }
  };

  MapImage.prototype.getInstagramUrl = function(imageLoadHandler) {
    var self = this;
    var map_string = this.instagram_url;
    map_string = map_string.replace('{latitude}', this.latitude);
    map_string = map_string.replace('{longitude}', this.longitude);
    $.ajax({
        type: "GET",
        url: map_string,
        jsonp: "callback",
        dataType: "jsonp",
        success: function( response ) {
          var random_image_number = Math.floor(Math.random()*(response.data.length-0+1)+0)
          imageLoadHandler(response.data[random_image_number].images.low_resolution.url);
        }
    });
  };

  MapImage.prototype.getFlickrUrl = function(imageLoadHandler) {
    var self = this;
    var map_string = this.flickr_url;
    map_string = map_string.replace('{latitude}', this.latitude);
    map_string = map_string.replace('{longitude}', this.longitude);
    map_string = map_string.replace('{page}', Math.floor(Math.random()*(5-0+1)+0));
    $.ajax({
        type: "GET",
        url: map_string,
        jsonp: "callback",
        dataType: "json",
        success: function( response ) {
          var random_image_number = Math.floor(Math.random()*(response.photos.photo.length-0+1)+0)
          if(response.photos.photo[random_image_number]){
            imageLoadHandler(response.photos.photo[random_image_number].url_q);
          }
        }
    });
  };

  MapImage.prototype.getInstagramDomElement = function(item_id, imageLoadHandler) {
    var self = this;
    self.getInstagramUrl(function(url) {
      imageLoadHandler($('<li></li>').attr({item_id: item_id}).append($('<img/>').attr('src', url)));
    });
  };

  MapImage.prototype.getFlickrDomElement = function(item_id, imageLoadHandler) {
    var self = this;
    self.getFlickrUrl(function(url) {
      imageLoadHandler($('<li></li>').attr({item_id: item_id}).append($('<img/>').attr('src', url)));
    });
  };

  MapImage.prototype.getDomElement = function(item_id, imageLoadHandler, errorHandler) {
    var self = this;
    var map_string = this.base_url;
    map_string = map_string.replace('{latitude}', this.latitude);
    map_string = map_string.replace('{longitude}', this.longitude);
    var map_img = $('<img/>').load(map_string, function(response, status, xhr) {
      if (status == "error"){
        errorHandler();
      } else {
        $(this).attr('src', map_string);
        imageLoadHandler();
      }
    })
    return $('<li></li>').attr({item_id: item_id}).append(map_img)
  };

  return MapImage;
});
