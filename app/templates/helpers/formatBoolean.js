/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/formatBoolean', ['hbs/handlebars'], function(Handlebars) {
  var fn = function(input) {
    if (input) {
      return '<i class="fa fa-bold fa-check-square"></i> ' + window.app.translator.get('Yes');
    }
    return '<i class="fa fa-square-o"></i> ' + window.app.translator.get('No');
  };
  Handlebars.registerHelper('formatBoolean', fn);
  return fn;
});
