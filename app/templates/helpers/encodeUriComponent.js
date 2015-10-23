/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/encodeUriComponent', ['hbs/handlebars'], function(Handlebars) {

  var f = function(input) {
    return encodeURIComponent(input);
  };
  Handlebars.registerHelper('encodeUriComponent', f);

  return f;
});