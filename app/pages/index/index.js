'use strict';
define(function (require) {
    var Super = require('views/page'),
        amplify = require('amplify'),
        TEMPLATE = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.render = function () {
        if( !this.session.isLoggedIn()){
            return this.goTo('index/sign-in');
        }

        if (!this.session.user.get('location')) {
            return this.goTo('index/detect-location', {trigger: true});
        }

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
        this.ready();
    };

    return Page;


});
