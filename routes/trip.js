'use strict';
module.exports = function(app) {
  var controller = app.controllers.trip;
  var acl = require('../acl');

  app.get('/trip/:id/invite', [controller.invite]);
  app.get('/trip', [acl.requireAuthenticated, controller.list]);
  app.post('/trip', [acl.requireAuthenticated, controller.create]);
};
