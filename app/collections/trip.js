'use strict';
define(function(require) {

  var Backbone = require('backbone'),
    Model = require('../models/trip');

  var Collection = Backbone.Firebase.Collection.extend({
    model: Model,
    autoSync: false,
    url: window.config.firebase.url + 'trips'
  });

  return Collection;
});
