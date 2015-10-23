/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/humanizeDateTime', ['hbs/handlebars', 'moment'], function(Handlebars, M) {

  if (!window.humanizeDateTime) {
    window.humanizeDateTime = function(input) {
      return M(input).calendar();
    };
  }

  Handlebars.registerHelper('humanizeDateTime', window.humanizeDateTime);

  return window.humanizeDateTime;
});
