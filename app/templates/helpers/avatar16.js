/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/avatar16', ['hbs/handlebars', 'models/user'], function(Handlebars, User) {
  var fn = function(input) {
    return '<img src="' + (input ? User.getAvatarUrl(input,
        16) : 'https://lh3.googleusercontent.com/-NZUz1TgH178/AAAAAAAAAAI/AAAAAAAAAAA/ecyN-pV8NGs/s32-c/photo.jpg') + '" class="img-circle" width="16" height="16"/>';
  };

  Handlebars.registerHelper('avatar16', fn);
  return fn;
});
