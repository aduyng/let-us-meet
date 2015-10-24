'use strict';
define(function (require) {
    //require the layout
    var Backbone = require('backbone'),
        B = require('bluebird'),
        Super = Backbone.Model,
        Layout = require('./views/layout'),
        Router = require('./router'),
        Session = require('models/session'),
        Translator = require('models/translator'),
        Config = require('./config'),
        Toastr = require('toastr'),
        Handlebars = require('hbs/handlebars'),
        L = require('./logger'),
        Firebase = require('firebase'),
        moment = require('moment'),
        Socket = require('./socket');
    var App = Super.extend({});

    App.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
    };


    App.prototype.initConfig = function () {
        this.config = new Config(window.config);
        return B.resolve();
    };


    App.prototype.initSocket = function () {
        this.socket = new Socket({
            app: this
        });

        this.socket.on('error', function (jqXHR, statusCode) {
            var options = {
                code: statusCode,
                message: jqXHR.responseText
            };
            /*eslint-disable*/
            try {
                options = JSON.parse(jqXHR.responseText);
            }
            catch (ignore) {
            }
            /*eslint-enable*/
            Toastr.error(Handlebars.compile('{{message}}')(options));
        });

        return B.resolve();
    };

    App.prototype.initRouter = function () {
        this.router = new Router({
            app: this
        });
        return B.resolve();
    };

    App.prototype.initLayout = function () {
        this.layout = new Layout({
            app: this
        });

        return B.resolve();
    };

    App.prototype.initTranslator = function () {
        var that = this;

        //return $.getJSON(window.config.baseUrl + '/templates/i18n/en-us.json', function (result) {
        //    that.translator = new Translator(result);
        that.translator = new Translator({});
        return that.translator;
        //});
    };


    App.prototype.initSession = function () {
        this.session = new Session();
        return this.session.fetch();
    };

    App.prototype.run = function () {
        var that = this;

        //var requestForLang = new B(function (resolve, reject) {
        //    return $.getJSON(window.config.baseUrl + '/' + window.config.version + '/templates/i18n/en-us.json', resolve, reject);
        //});

        var start = moment().valueOf();

        return B.all([
            this.initTranslator(),
            this.initSocket(),
            this.initConfig(),
            this.initSession(),
            this.initLayout(),
            this.initRouter()
        ]).spread(function () {
            if (window.config.firebase.isEnabled && that.session.isLoggedIn()) {
                that.firebase = new Firebase(window.config.firebase.url + 'users/' + that.session.getUser().get('userId'));
            }
            return that.layout.render();
        }).then(function () {
            return that.router.start();
        });


    };


    Object.defineProperty(App.prototype, 'router', {
        get: function () {
            return this.get('router');
        },
        set: function (val) {
            this.set('router', val);
        }
    });

    Object.defineProperty(App.prototype, 'layout', {
        get: function () {
            return this.get('layout');
        },
        set: function (val) {
            this.set('layout', val);
        }
    });

    Object.defineProperty(App.prototype, 'toast', {
        get: function () {
            return this.get('layout').toast;
        }
    });

    Object.defineProperty(App.prototype, 'session', {
        get: function () {
            return this.get('session');
        },
        set: function (val) {
            this.set('session', val);
        }
    });

    Object.defineProperty(App.prototype, 'config', {
        get: function () {
            return this.get('config');
        },
        set: function (val) {
            this.set('config', val);
        }
    });
    Object.defineProperty(App.prototype, 'translator', {
        get: function () {
            return this.get('translator');
        },
        set: function (val) {
            this.set('translator', val);
        }
    });

    return App;
});
