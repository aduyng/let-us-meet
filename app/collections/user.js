'use strict';
define(function(require) {

  var Super = require('./base'),
    Model = require('../models/user');

  var Collection = Super.extend({
    model: Model,
    comparator: 'name'
  });

  return Collection;
});
