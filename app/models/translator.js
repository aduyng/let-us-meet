'use strict';
define(function(require) {
  var Super = require('./base'),
    _ = require('underscore'),
    Handlebars = require('hbs/handlebars');

  var Model = Super.extend({
    url: function() {
      return window.config.baseUrl + '/' + window.config.version + '/templates/i18n/en-us.json';
    }
  });

  Model.prototype.get = function(key, options) {
    var k = Super.prototype.get.call(this, key) || key;
    if (!_.isEmpty(options)) {
      var template = Handlebars.compile(k);
      return template(options);
    }
    return k;
  };


  Model.prototype.translate = Model.prototype.get;
  return Model;
});
