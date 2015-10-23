/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/apiBaseUrl', ['hbs/handlebars'], function(Handlebars) {
  if (!window.apiBaseUrl) {
    window.apiBaseUrl = function(input) {
      return window.config.apiBaseUrl + input;
    };
  }
  Handlebars.registerHelper('apiBaseUrl', window.apiBaseUrl);

  return window.apiBaseUrl;
});
