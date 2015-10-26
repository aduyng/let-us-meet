'use strict';
module.exports = function (app) {
    var controller = app.controllers.place;
    var acl = require('../acl');

    app.get('/place/autocomplete', controller.autocomplete);
    app.get('/place/:id', controller.read);
};