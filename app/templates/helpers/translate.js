/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/translate', ['hbs/handlebars'], function(Handlebars) {
  var fn = function(input) {
    return window.app.translator.get(input) || input;
  };
  Handlebars.registerHelper('translate', fn);

  return fn;
});
