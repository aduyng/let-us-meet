'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    Super = Backbone.Firebase.Model,
    ObjectId = require('ObjectId');

  var Model = Super.extend({
    urlRoot: function() {
      return window.config.firebase.url + this.name;
    }
  });

  Model.getRandomId = function() {
    return new ObjectId().toString();
  };

  return Model;
});
