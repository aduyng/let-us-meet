'use strict';
define(function (require) {
    var Super = require('./base'),
        _ = require('underscore'),
        User = require('models/user');


    var Model = Super.extend({
        url: '/session'
    });


    Model.prototype.getUser = function () {
        return this.getAndCache('user', User);
    };


    Model.prototype.isLoggedIn = function () {
        return this.get('isLoggedIn') && !this.getUser().isGuest();
    };

    return Model;
});
