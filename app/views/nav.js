'use strict';
define(function (require) {
    var Super = require('views/base'),
        B = require('bluebird'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Dialog = require('views/controls/dialog'),
        TEMPLATE = require('hbs!./nav.tpl');

    var View = Super.extend({
        id: 'nav'
    });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
        window.app.on('page-rendered', this.onPageRendered.bind(this));

        this.inboxCountModel = new Backbone.Model();
        this.inboxCountModel.url = '/index/inbox/count';
    };

    View.prototype.onPageRendered = function (page) {
        this.find(this.toClass('top-level-menu-item')).removeClass('active');
        switch (page.options.controller) {
        case 'workflow':
            if (this.controls.workflowsTopLevelMenuItem) {
                this.controls.workflowsTopLevelMenuItem.addClass('active');
            }
            break;
        case 'user':
            if (this.controls.usersTopLevelMenuItem) {
                this.controls.usersTopLevelMenuItem.addClass('active');
            }
            break;
        case 'document':
            switch (page.options.action) {
            case 'inbox':
                this.controls.inboxTopLevelMenuItem.addClass('active');
                break;
            case 'list':
            case 'view':
            case 'create':
                this.controls.documentsTopLevelMenuItem.addClass('active');
                break;
            }
            break;
        }
        if (this.controls.toggleButton.is(':visible') && this.controls.main.hasClass('in')) {
            this.controls.toggleButton.trigger('click');
        }
    };

    View.prototype.render = function () {
        var that = this;
        var user = window.app.session.getUser();
        var isLoggedIn = window.app.session.isLoggedIn();
        var isActive = isLoggedIn && user.get('isActive');
        var isAdmin = isActive && user.isAdmin();
        var isImpersonated = window.app.session.get('impersonatingUserId');

        var params = {
            id: this.id,
            isLoggedIn: isLoggedIn,
            isActive: isActive,
            isAdmin: isAdmin,
            isImpersonated: isImpersonated,
            config: window.app.config.toJSON()
        };

        if (window.app.session.isLoggedIn()) {
            params.user = _.extend(window.app.session.user.toJSON(), {
                avatarSize: 50,
                avatarUrl: window.app.session.user.getAvatarUrl(50)
            });
        }
        this.$el.html(TEMPLATE(params));
        this.mapControls();

        if (window.app.session.isLoggedIn()) {
            var events = {};
            events['click ' + that.toId('impersonate')] = 'onImpersonateClick';
            events['click ' + that.toId('restore-impersonate')] = 'onRestoreImpersonateClick';
            this.delegateEvents(events);

            window.app.firebase.on('value', function (resp) {
                //var value = (resp.val() || {}).inboxCount || 0;
                //this.renderInboxCount(value);
            }.bind(this));

        }
    };

    return View;
});
