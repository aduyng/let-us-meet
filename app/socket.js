'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    _ = require('underscore'),
    Super = Backbone.Model,
    L = require('logger');
  var Model = Super.extend({});

  Model.prototype.request = function(opts) {
    var options = opts || {};

    if (!options.url) {
      options.url = [options.controller || 'index',
        options.action || 'index'].join('/');
      delete options.controller;
      delete options.action;
    }
    if (!options.data) {
      options.data = {};
    }

    var oldCallbacks = _.pick(options, 'success', 'error');

    var callbacks = {
      success: function(resp, textStatus, jqXHR) {
        if (!oldCallbacks.success || oldCallbacks.success(resp, textStatus, jqXHR) !== false) {
          L.debug(options.url, resp);
        }
      },
      error: function(jqXHR, status, errorThrown) {
        if (!oldCallbacks.error || oldCallbacks.error(jqXHR, status, errorThrown) !== false) {
          this.trigger('error', jqXHR, status, errorThrown);
        }
      }.bind(this)
    };

    _.extend(options, callbacks);
    return Backbone.ajax.call(this, options);
  };

  return Model;
});
