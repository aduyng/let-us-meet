'use strict';
define(function(require) {

  var Super = require('./base'),
    Model = require('../models/airport'),
    airports = require('json!data/airports.json');

  var Collection = Super.extend({
    model: Model
  });

  Collection.getInstance = function() {
    if (!Collection.instance) {
      Collection.instance = new Collection(airports);
    }
    return Collection.instance;
  };
  return Collection;
});
