'use strict';
module.exports = function(app) {
  var controller = app.controllers.user;
  var acl = require('../acl');

  // app.get('/session', controller.get);
  app.post('/user', controller.post);
  app.put('/user/:id', controller.put);
  // app.get('/session/login', controller.login);


  // app.get('/session/logout', [acl.requireAuthenticated, controller.logout]);
};
