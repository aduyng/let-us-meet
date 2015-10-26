'use strict';
define(function(require) {
  var Super = require('./base');

  var Model = Super.extend({
    name: 'trips',
    autoSync: true
  });

  return Model;
});
