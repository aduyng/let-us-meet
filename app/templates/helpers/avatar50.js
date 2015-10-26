/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/avatar50', ['hbs/handlebars', 'models/user'], function(Handlebars, User) {

  if (!window.avatar50) {
    window.avatar50 = function(input) {
      return '<img src="' + User.getAvatarUrl(input) + '" class="img-circle avatar" width="50" height="50"/>';
    };
  }
  Handlebars.registerHelper('avatar50', window.avatar50);

  return window.avatar50;
});
