'use strict';
var User = require('./odm/models/user'),
  config = require('./config'),
  U = require('./utils');

exports.requireAuthenticated = function(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.send(401);
};