'use strict';
define(function(require) {

  var Super = require('./realtime'),
    Model = require('../models/user');

  var Collection = Super.extend({
    model: Model,
    comparator: 'name'
  });

  return Collection;
});
