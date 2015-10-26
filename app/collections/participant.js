'use strict';
define(function(require) {
  var Super = require('./realtime'),
    Model = require('../models/participant');

  var Collection = Super.extend({
    model: Model,
    autoSync: true,
    url: window.config.firebase.url + 'participants'
  });

  return Collection;
});
