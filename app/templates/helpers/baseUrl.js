/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/baseUrl', ['hbs/handlebars'], function(Handlebars) {
  if (!window.baseUrl) {
    window.baseUrl = function(input) {
      return window.config.baseUrl + input;
    };
  }
  Handlebars.registerHelper('baseUrl', window.baseUrl);

  return window.baseUrl;
});
