'use strict';
module.exports = function (app) {
    var controller = app.controllers.index;
    var acl = require('../acl');

    app.get('/', controller.home);
};