'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    Super = Backbone.Firebase.Model,
    ObjectId = require('ObjectId');

  var Model = Super.extend({
    url: function() {
      return window.config.firebase.url + this.name + (this.attributes && this.attributes.id ? ('/' + this.attributes.id) : '');
    }
  });

  Model.getRandomId = function(){
    return new ObjectId().toString();
  };

  Model.prototype.getAndCache = function(key, ClassName) {
    if (!this[key]) {
      this[key] = new ClassName(this.get(key));
    }
    return this[key];
  };

  Model.prototype.clearCachedObjects = function(key) {
    if (!_.isArray(key)) {
      key = [key];
    }
    _.each(key, function(k) {
      if (this[k]) {
        delete this[k];
      }
    }.bind(this));
    return this;
  };

  return Model;
});
