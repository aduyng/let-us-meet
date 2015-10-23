'use strict';
define('templates/helpers/helpIcon', ['hbs/handlebars', 'underscore.string'], function(Handlebars, S) {
  var fn = function(input) {
    return '<i class="fa fa-info-circle text-info" data-help-text="' + S.escapeHTML(window.app.translator.get(input) || input) + '"></i>';
  };
  Handlebars.registerHelper('helpIcon', fn);

  return fn;
});