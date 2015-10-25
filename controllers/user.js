'use strict';
var config = require('../config'),
    _ = require('underscore'),
    S = require('underscore.string'),
    U = require('../utils'),
    B = require('bluebird'),
    L = require('../logger'),
    User = require('../odm/models/user');


exports.get = function (req, res, next) {
    var data = {};
    if (req.session.userId) {
        return User.findByIdAsync(req.session.userId, '-auth')
            .then(function (user) {
                if (user) {
                    data.isLoggedIn = true;
                    data.user = user.export(user);
                }
                res.send(data);
            })
            .catch(function (e) {
                L.errorAsync(e);
            });
    }
    res.send(data);
};

exports.post = function (req, res, next) {
    B.resolve()
        .then(function () {
            if (req.params.id) {
                return User.findByIdAsync(req.params.id)
            }
            if (req.body.userId) {
                return User.findOneAsync({
                    userId: req.body.userId
                });
            }

            return new User();
        })
        .then(function (user) {
            _.extend(user, _.pick(req.body, 'accessToken', 'expiresIn', 'name', 'signedRequest', 'location', 'userId', 'email'));
            return user.saveAsync();
        })
        .spread(function (user) {
            req.session.userId = user.userId;
            res.send(user);
        });

};

exports.put = function (req, res, next) {
    B.resolve()
        .then(function () {
            if (req.params.id) {
                return User.findByIdAsync(req.params.id)
            }
            if (req.body.userId) {
                return User.findOneAsync({
                    userId: req.body.userId
                });
            }

            return new User();
        })
        .then(function (user) {
            _.extend(user, _.pick(req.body, 'accessToken', 'expiresIn', 'name', 'signedRequest', 'location', 'userId', 'email'));
            return user.saveAsync();
        })
        .spread(function (user) {
            res.send(user);
        });
};


// exports.logout = function (req, res, next) {
//     delete req.session.userId;
//     delete req.session.impersonatingUserId;
//     delete req.session.user;
//     delete req.session.domain;
//     res.redirect('/');
// };