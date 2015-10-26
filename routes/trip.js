'use strict';
module.exports = function(app) {
  var controller = app.controllers.trip;
  var acl = require('../acl');

  app.get('/trip/:id/invite', [controller.invite]);
  app.get('/trip/:id', [controller.read]);
  app.get('/trip', [acl.requireAuthenticated, controller.list]);
  app.post('/trip', [acl.requireAuthenticated, controller.create]);
  app.put('/trip/:id', [acl.requireAuthenticated, controller.update]);
  app.delete('/trip/:id', [acl.requireAuthenticated, controller.delete]);
};
