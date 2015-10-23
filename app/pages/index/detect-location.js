'use strict';
define(function (require) {
    var Super = require('views/page'),
        B = require('bluebird'),
        geolocator = require('geolocator'),
        TEMPLATE = require('hbs!./detect-location.tpl');

    var Page = Super.extend({});

    Page.prototype.render = function () {
        var me = this;

        var params = {
            id: this.id,
            config: window.app.config.toJSON(),
            isLoggedIn: window.app.session.get('user') !== undefined,
            redirectUrl: this.session.get('redirectUrl') || '#document/inbox'
        };

        this.$el.html(TEMPLATE(params));
        this.mapControls();

        var events = {};

        this.delegateEvents(events);

        this.requestLocation()
            .then(function (location) {
                if (location) {
                    me.session.user.set('location', location);
                    return B.resolve(me.session.user.save())
                        .then(function () {
                            me.goTo('#index/index', {trigger: true, replace: true});
                        });
                }
                return me.ready();
            })
            .catch(function () {
                return me.reload();
            });
    };

    Page.prototype.requestLocation = function () {
        return new B(function (resolve, reject) {
            geolocator.locate(resolve, reject, true);
        });
    };

    return Page;


});
