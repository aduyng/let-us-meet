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

exports.requireAdministrator = function(req, res, next) {
  if (req.user && (req.user.isAdmin || req.user.getEmailDomain() === config.app.domain)) {
    return next();
  }
  res.send(403);
};

exports.requireDomainAdministrator = function(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.send(403);
};

exports.requireSystemAdministrator = function(req, res, next) {
  if (req.user && req.user.getEmailDomain() === config.app.domain) {
    return next();
  }
  res.send(403);
};

exports.requireImpersonated = function(req, res, next) {
  if (req.session && req.session.impersonatingUserId) {
    return next();
  }
  res.send(403);
};