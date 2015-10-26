'use strict';
define(function(require) {
  var Super = require('./realtime'),
    _ = require('underscore'),
    User = require('models/user');


  var Model = Super.extend({
    name: 'session'
  });

  Model.prototype.getUser = function() {
    return this.getAndCache('user', User);
  };


  Model.prototype.isLoggedIn = function() {
    return this.get('isLoggedIn');
  };


  return Model;
});
