'use strict';
define(function(require) {
  var Super = require('./base');

  var Model = Super.extend({
    name: 'airport',
    idAttribute: 'code'
  });

  return Model;
});
