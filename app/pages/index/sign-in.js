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

        return me.ready();
    };


    return Page;


});
