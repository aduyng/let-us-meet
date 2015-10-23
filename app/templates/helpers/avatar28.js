/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/avatar28', ['hbs/handlebars', 'models/user'], function(Handlebars, User) {

  if (!window.avatar28) {
    window.avatar28 = function(input) {
      return '<img src="' + (input ? User.getAvatarUrl(input,
          28) : 'https://lh3.googleusercontent.com/-NZUz1TgH178/AAAAAAAAAAI/AAAAAAAAAAA/ecyN-pV8NGs/s32-c/photo.jpg') + '" class="img-circle" width="28" height="28"/>';
    };
  }
  Handlebars.registerHelper('avatar28', window.avatar28);

  return window.avatar28;
});
