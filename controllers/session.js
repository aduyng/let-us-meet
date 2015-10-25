'use strict';
var config = require('../config'),
  _ = require('underscore'),
  S = require('underscore.string'),
  U = require('../utils'),
  B = require('bluebird'),
  L = require('../logger'),
  User = require('../odm/models/user');


exports.get = function(req, res, next) {
  var data = {};
  if (req.session.userId) {
    return User.findOneAsync({userId: req.session.userId})
      .then(function(user) {
        if (user) {
          data.isLoggedIn = true;
          data.user = user.export(user);
        }
        res.send(data);
      })
      .catch(function(e) {
        L.errorAsync(e);
      });
  }
  res.send(data);
};


exports.logout = function(req, res, next) {
  delete req.session.userId;
  delete req.session.impersonatingUserId;
  delete req.session.user;
  delete req.session.domain;
  res.redirect('/');
};