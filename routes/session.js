'use strict';
module.exports = function(app) {
  var controller = app.controllers.session;
  var acl = require('../acl');

  app.get('/session', controller.get);
  app.get('/session/login', controller.login);
  app.get('/session/login/callback', controller.loginCallback);

  app.get('/session/logout', [acl.requireAuthenticated, controller.logout]);
};
