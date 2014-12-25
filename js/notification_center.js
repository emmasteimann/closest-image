define([
  'jquery'
], function($){
  function NotificationCenter() {
    this.registered_receivers = {};
    this.receiver_guid = 0;
  }

  NotificationCenter.prototype.emit = function() {
    if (arguments.length === 0) return;
    var message = [].shift.call(arguments,1);
    var args = arguments;
    if (message && this.registered_receivers.hasOwnProperty(message)) {
      for (var i = 0; i < this.registered_receivers[message].length; i++) {
        var receiver = this.registered_receivers[message][i];
        receiver["receiver"].apply(this, args)
      }
    }
  }

  NotificationCenter.prototype.getGuid = function() {
    var current_guid = this.receiver_guid;
    this.receiver_guid++;
    return current_guid;
  };

  NotificationCenter.prototype.subscribe = function() {
    if (arguments.length === 0) return;
    var message = arguments[0];
    var receiver = arguments[1];
    if (message && receiver) {
      if (!this.registered_receivers[message]) this.registered_receivers[message] = [];
      var subscription_guid = this.getGuid()
      this.registered_receivers[message].push({"receiver": receiver, "guid": subscription_guid});
      return subscription_guid;
    }
  }

  NotificationCenter.prototype.unsubscribe = function() {
    if (arguments.length === 0) return;
    var message = arguments[0];
    var guid = arguments[1];
    if (message && guid) {
      if (!this.registered_receivers[message]) return;
      for (var i = 0; i < this.registered_receivers[message].length; i++) {
        var receiver = this.registered_receivers[message][i];
        if(receiver["guid"] === guid) {
          delete this.registered_receivers[message].splice(i, 1);;
          break;
        }
      }
    }
  }

  return NotificationCenter;
});
