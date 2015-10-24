'use strict';
define(function (require) {
    var Super = require('views/page'),
        B = require('bluebird'),
        FB = require('fb'),
        TEMPLATE = require('hbs!./sign-in.tpl');

    var Page = Super.extend({});

    Page.prototype.render = function () {
        var me = this;
        this.$el.html(TEMPLATE());
        this.mapControls();

        var events = {};
        this.delegateEvents(events);

        this.getLoginStatus();

        return me.ready();
    };

    Page.prototype.loginLoop = function (response) {
        var me = this;
        if (response.status !== 'connected') {
            return new B(function (resolve) {
                    FB.login(resolve, {
                        scope: 'public_profile,email,user_friends'
                    });
                })
                .then(function (response) {
                    return me.loginLoop(response);
                });
        };
        //TODO: handle missing pemissions
        return B.resolve(response);
    };

    Page.prototype.getLoginStatus = function () {
        var me = this;
        return new B(function (resolve) {
                FB.getLoginStatus(resolve);
            })
            .then(function (response) {
                return me.loginLoop(response);
            })
            .then(function (response) {
                me.session.set('user', _.extend(me.session.get('user') || {}, {
                        accessToken: response.authResponse.accessToken,
                        expiresIn: response.authResponse.expiresIn,
                        signedRequest: response.authResponse.signedRequest,
                        userId: response.authResponse.userID
                    }))
                    .clearCachedObjects('user');

                return new B(function (resolve) {
                    FB.api('/me', resolve);
                });
            })
            .then(function (user) {
                me.session.set('user', _.extend(me.session.get('user') || {}, {
                    name: user.name
                }))
                    .clearCachedObjects('user');
                return B.resolve(me.session.getUser().save());
            })
            .then(function () {
                me.goTo('index/index', {
                    trigger: true,
                    replace: true
                });
            });
    };


    return Page;


});
