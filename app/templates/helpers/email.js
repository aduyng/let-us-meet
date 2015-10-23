/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/email', ['hbs/handlebars', 'models/user'], function(Handlebars) {

  var email = function(input) {
    return '<a href="mailto:' + input + '">' + input + '</a>';
  };
  Handlebars.registerHelper('email', email);

  return email;
});
