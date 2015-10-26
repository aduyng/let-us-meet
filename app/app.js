'use strict';
define(function(require) {
  //require the layout
  var Backbone = require('backbone'),
    B = require('bluebird'),
    Super = Backbone.Model,
    Layout = require('./views/layout'),
    Router = require('./router'),
    Session = require('models/session'),
    Translator = require('models/translator'),
    Toastr = require('toastr'),
    Handlebars = require('hbs/handlebars'),
    L = require('./logger'),
    Firebase = require('firebase'),
    moment = require('moment'),
    Socket = require('./socket');
  var App = Super.extend({});


  App.prototype.initSocket = function() {
    this.socket = new Socket({
      app: this
    });

    this.socket.on('error', function(jqXHR, statusCode) {
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

  App.prototype.initRouter = function() {
    this.router = new Router({
      app: this
    });
    return B.resolve();
  };

  App.prototype.initLayout = function() {
    this.layout = new Layout({
      app: this
    });

    return B.resolve();
  };

  App.prototype.initTranslator = function() {
    var that = this;

    //return $.getJSON(window.config.baseUrl + '/templates/i18n/en-us.json', function (result) {
    //    that.translator = new Translator(result);
    that.translator = new Translator({});
    return that.translator;
    //});
  };

  App.prototype.initFirebase = function() {
    return new B(function(resolve) {
      var connectedRef = new Firebase(window.config.firebase.url + '.info/connected');
      connectedRef.on('value', function(snap) {
        if (snap.val() === true) {
          resolve();
        }
      });
    });
  };

  App.prototype.run = function() {
    var that = this;

    return B.all([
      this.initTranslator(),
      this.initSocket(),
      this.initFirebase(),
      this.initLayout(),
      this.initRouter()
    ])
      .then(function() {
        return that.layout.render();
      })
      .then(function() {
        return that.router.start();
      });
  };


  Object.defineProperty(App.prototype, 'router', {
    get: function() {
      return this.get('router');
    },
    set: function(val) {
      this.set('router', val);
    }
  });

  Object.defineProperty(App.prototype, 'layout', {
    get: function() {
      return this.get('layout');
    },
    set: function(val) {
      this.set('layout', val);
    }
  });

  Object.defineProperty(App.prototype, 'toast', {
    get: function() {
      return this.get('layout').toast;
    }
  });

  Object.defineProperty(App.prototype, 'session', {
    get: function() {
      return this.get('session');
    },
    set: function(val) {
      this.set('session', val);
    }
  });

  Object.defineProperty(App.prototype, 'translator', {
    get: function() {
      return this.get('translator');
    },
    set: function(val) {
      this.set('translator', val);
    }
  });

  return App;
});
