'use strict';
define(function(require) {
  var Super = require('./base'),
    Model = require('models/trip');

  var Collection = Super.extend({
    model: Model,
    autoSync: true
  });

  return Collection;
});
