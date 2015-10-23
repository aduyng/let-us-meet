'use strict';
var config = require('../config'),
    _ = require('underscore'),
    S = require('underscore.string'),
    U = require('../utils'),
    B = require('bluebird'),
    GClient = require('../gclient'),
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

exports.login = function (req, res, next) {
    var gclient = new GClient();
    var url = gclient.oauth.generateAuthUrl({
        /*eslint-disable */
        access_type: 'offline',
        /*eslint-enable*/
        scope: config.google.scopes
    });

    res.redirect(url);
};

exports.loginCallback = function (req, res, next) {
    var tokens, profile, user;
    var gclient = new GClient();
    var client = gclient.oauth;
    var isAdmin, directoryUserInfo, isFirstTime;

    B.resolve(new B(function (resolve, reject) {
        client.getToken(req.query.code, function (err, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body);
        });
    }))
        .then(function (toks) {
            tokens = toks;
            client.setCredentials(tokens);
            var plus = gclient.google.plus('v1');

            return new B(function (resolve, reject) {
                //fetch the template file from drive
                plus.people.get({
                    userId: 'me',
                    auth: client
                }, function (err, body) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(body);
                });
            });

        })
        .then(function (p) {
            profile = p;

            var admin = gclient.google.admin('directory_v1');

            return new B(function (resolve, reject) {
                admin.users.get({
                        userKey: profile.emails[0].value
                    },
                    function (err, body) {
                        if (err || !body) {
                            L.warn(err || body);
                            resolve(false);
                            return;
                        }

                        resolve(body);
                    });
            });
        })
        .then(function (info) {
            isAdmin = !_.isEmpty(info) && (info.isAdmin || info.isDelegatedAdmin);
            directoryUserInfo = info;
            var domainName = profile.emails[0].value.split('@').pop();
            return DomainModel.findOneAsync({
                name: domainName
            })
                .then(function (doc) {
                    if (!doc) {
                        doc = new DomainModel({
                            name: domainName,
                            syncStatus: 'SCHEDULED'
                        });
                        isFirstTime = true;
                        return doc.saveAsync()
                            .spread(function (savedDoc) {
                                L.infoAsync('New domain %s has been created!', domainName);
                                return savedDoc;
                            });
                    }
                    return B.resolve(doc);
                });
        })
        .then(function (domain) {
            return domain.createGuestIfNotExist()
                .then(function () {
                    return B.resolve(domain);
                });
        })
        .then(function (domain) {
            return User.findOneAsync({
                domainId: domain._id,
                email: profile.emails[0].value
            }, '+auth')
                .then(function (doc) {

                    if (!doc) {
                        return new User({
                            auth: {
                                google: {
                                    uid: profile.id,
                                    tokens: tokens
                                }
                            },
                            uid: profile.id,
                            domain: domain.name,
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            profileUrl: profile.url,
                            avatarUrl: (profile.image || {}).url,
                            isAdmin: isAdmin,
                            isActive: isAdmin,
                            domainId: domain._id,
                            lastLoggedInAt: _.now(),
                            customerId: directoryUserInfo.customerId
                        })
                            .saveAsync();
                    }

                    var toks = _.extend({}, ((doc.auth || {}).google || {}).tokens, tokens);

                    L.infoAsync('controllers/session.js:: got user', doc.toJSON());

                    return doc.set({
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        profileUrl: profile.url,
                        avatarUrl: (profile.image || {}).url,
                        isAdmin: isAdmin,
                        auth: {
                            google: {
                                uid: profile.id,
                                tokens: toks
                            }
                        },
                        domainId: domain._id,
                        uid: profile.id,
                        lastLoggedInAt: _.now(),
                        customerId: directoryUserInfo.customerId
                    })
                        .saveAsync();
                })
                .spread(function (u) {
                    user = u;
                    req.session.userId = user._id;
                    req.session.user = user.toJSON();
                    req.session.domain = domain.toJSON();

                    var url = req.session.redirectUrl;
                    L.infoAsync(__filename + ' ::loginCallback() ', isAdmin ? 'user IS an admin' : 'user is NOT an admin');

                    if (isAdmin && isFirstTime) {
                        B.promisify(agenda.jobs, agenda)({
                            name: 'directory-sync:all',
                            domainId: domain._id,
                            actorId: user._id
                        })
                            .then(function (jobs) {
                                var job;
                                if (!jobs || _.isEmpty(jobs)) {
                                    job = agenda.create('directory-sync:all', {
                                        domainId: domain._id,
                                        actorId: user._id
                                    });

                                    job.unique({
                                        'data.domainId': domain._id
                                    });
                                }
                                else {
                                    job = jobs[0];
                                }
                                job.schedule('now');
                                return B.promisify(job.save, job)()
                                    .then(function () {
                                        L.infoAsync(__filename + ' ::loginCallback() directory-sync:all has been scheduled.');
                                    });
                            })
                            .catch(function (e) {
                                console.error(e);
                                L.errorAsync(__filename + ' ::loginCallback() unable to schedule directory-sync:all: %s', JSON.stringify(e));
                            });
                    }

                    L.info('SessionController::loginCallback() -> User %s has logged in.', user.name);
                    if (url) {
                        L.info('pull redirectUrl from session: %s', url);
                        req.session.redirectUrl = null;
                    }
                    else {
                        url = config.app.backend + '/#index/index';
                    }
                    res.redirect(url);
                });
        })
        .catch(function (e) {
            U.sendError(e, req, res, next);
        });
};

exports.logout = function (req, res, next) {
    delete req.session.userId;
    delete req.session.impersonatingUserId;
    delete req.session.user;
    delete req.session.domain;
    res.redirect('/');
};