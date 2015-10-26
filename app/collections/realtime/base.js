'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    Super = Backbone.Firebase.Collection,
    _ = require('underscore'),
    Model = require('models/base'),
    Collection = Super.extend({
      model: Model
    });

  return Collection;
});
