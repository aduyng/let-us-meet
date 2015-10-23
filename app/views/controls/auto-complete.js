'use strict';
define(function(require) {
  var Super = require('views/base'),
    Select2 = require('select2'),
    _ = require('underscore'),
    B = require('bluebird'),
    View = Super.extend({});

  View.prototype.initialize = function(options) {
    Super.prototype.initialize.call(this, options);
  };

  View.prototype.select2 = function() {
    return this.$el.select2.apply(this.$el, arguments);
  };


  return View;
});
