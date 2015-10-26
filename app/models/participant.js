'use strict';
define(function(require) {
  var Super = require('./base');

  var Model = Super.extend({
    name: 'participant'
  });

  return Model;
});
