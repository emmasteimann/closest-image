require.config({
  paths: {
    jquery: 'vendor/jquery/jquery'
  }
});

require([
  'js/app',
  'js/notification_center',
  'js/user',
], function(Game, NC, NewUser){

  window.NotificationCenter = new NC();
  window.User = new NewUser();
  window.ClosestGuessGame = new Game();

  ClosestGuessGame.initialize();

});
