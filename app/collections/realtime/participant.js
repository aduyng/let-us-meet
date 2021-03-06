'use strict';
define(function(require) {
  var Super = require('./base'),
    Model = require('models/participant');

  var Collection = Super.extend({
    model: Model,
    autoSync: true
  });

  return Collection;
});
