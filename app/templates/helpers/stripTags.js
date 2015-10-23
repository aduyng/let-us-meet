/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/stripTags', ['hbs/handlebars', 'underscore.string'], function(HB, S) {
  var fn = function(input) {
    return S.stripTags(input);
  };
  HB.registerHelper('stripTags', fn);

  return fn;
});
