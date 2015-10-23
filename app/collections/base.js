'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    Super = Backbone.Collection,
    _ = require('underscore'),
    Model = require('../models/base'),
    Collection = Super.extend({
      model: Model
    });

  Collection.prototype.initialize = function(options) {
    var url;
    Super.prototype.initialize.call(this, options);
    if (_.isEmpty(_.result(this, 'url'))) {
      if ((options || {}).url) {
        this.url = (options || {}).url;
      } else {
        url = _.result(this.model.prototype, 'url');

        if (!_.isEmpty(url)) {
          this.url = url;
        } else {
          this.url = '/' + (this.name || this.model.prototype.name);
        }
      }
    }
  };
  return Collection;
});
