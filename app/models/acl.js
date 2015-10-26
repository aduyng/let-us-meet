'use strict';
define(function(require) {
  var _ = require('underscore'),
    Backbone = require('backbone'),
    Super = Backbone.Model;

  var Model = Super.extend({
    defaults: {
      routes: {
        'index/index': [],
        'index/detect-location': [],
        'error/index': [],
        'index/sign-in': []
      }
    }
  });


  Model.prototype.isAllowed = function(route) {
    var that = this;
    var checkers = (this.get('routes') || {})[route];
    if (_.isUndefined(checkers)) {
      this._redirectToErrorPageWithMessage(window.app.translator.get('Page not found!'));
      return false;
    }
    return _.every(checkers, function(checker) {
      return _.result(that, checker, false);
    });
  };

  Model.prototype._redirectToErrorPageWithMessage = function(message) {
    window.app.router.navigate('#error/index/message/' + encodeURIComponent(message), {replace: true, trigger: true});
  };

  Model.prototype.requireAuthenticated = function() {
    if (window.app.session.isLoggedIn()) {
      return true;
    }
    window.app.router.navigate('#index/index/', {replace: true, trigger: true});
    return false;
  };

  return Model;
});

