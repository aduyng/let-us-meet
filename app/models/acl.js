'use strict';
define(function(require) {
  var _ = require('underscore'),
    Backbone = require('backbone'),
    amplify = require('amplify'),
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
    amplify.store.localStorage('redirectUrl', window.location.hash);
    window.app.router.navigate('#index/index/', {replace: true, trigger: true});
    return false;
  };

  Model.prototype.requireActive = function() {
    if (window.app.session.user && window.app.session.user.get('isActive')) {
      return true;
    }
    this._redirectToErrorPageWithMessage(window.app.translator.get('Your account is not activate! Please contact your domain administrator to activate your account.'));
    return false;
  };

  Model.prototype.requireAdministrator = function() {
    if (window.app.session.user && window.app.session.user.isAdmin()) {
      return true;
    }
    this._redirectToErrorPageWithMessage(window.app.translator.get('You must have administrator privilege to access this page!'));
    return false;
  };

  return Model;
});

