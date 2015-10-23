/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/avatar40', ['hbs/handlebars', 'models/user'], function(Handlebars, User) {
  var fn = function(input) {
    return '<img src="' + (input ? User.getAvatarUrl(input,
        40) : 'https://lh3.googleusercontent.com/-NZUz1TgH178/AAAAAAAAAAI/AAAAAAAAAAA/ecyN-pV8NGs/s40-c/photo.jpg') + '" class="img-circle" width="40" height="40"/>';
  };

  Handlebars.registerHelper('avatar40', fn);

  return fn;
});
