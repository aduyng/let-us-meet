'use strict';
define(function(require) {
  var moment = require('moment'),
    B = require('bluebird'),
    Backbone = require('backbone'),
    S = require('underscore.string'),
    L = require('logger'),
    amplify = require('amplify'),
    NProgress = require('nprogress'),
    Super = Backbone.Router,
    Router = Super.extend({
      routes: {
        '*action': 'defaultAction'
      }
    }),
    Acl = require('models/acl');
  Router.prototype.initialize = function(options) {
    Backbone.Router.prototype.initialize.call(this, options);
    this.app = options.app || console.error('app must be passed!');

    this.acl = new Acl();
  };

  Router.prototype.defaultAction = function(url) {
    var that = this;
    var html = $('html');
    if (!url) {
      url = 'index/index';
    }
    if (that.app.page) {
      html.removeClass(that.app.page.options.controller + '-' + that.app.page.options.action);

      //clean up
      if (that.app.page.close() === false) {
        return false;
      }
      //trigger an event
      that.app.trigger('closed');
    }

    //split the url to controller/action
    var parts = url.split('/');
    var controller = parts[0] || 'index';
    var action = parts[1] || 'index';
    var params = {
      now: moment().unix()
    };
    if (this.acl.isAllowed([controller, action].join('/'))) {
      if (parts.length > 2) {
        var i;
        for (i = 2; i < parts.length; i += 2) {
          params[S.camelize(parts[i])] = parts[i + 1];
        }
      }
      NProgress.start();


      var pagePath = 'pages/' + controller + '/' + action;
      L.debug('router::defaultAction() loading page', {
        pagePath: pagePath,
        params: params,
        controller: controller,
        action: action
      });
      var start = moment().valueOf();
      require([pagePath], function(Page) {
        NProgress.inc();
        that.app.trigger('page-loaded', that.app.page);

        that.app.page = new Page({
          id: [controller, action].join('-'),
          el: that.app.layout.controls.mainPanel,
          controller: controller,
          action: action,
          app: that.app,
          params: params,
          toast: that.app.layout.toast,
          hash: window.location.hash
        });
        html.addClass(controller + '-' + action);

        NProgress.inc();
        B.resolve(that.app.page.render()).then(function() {
          L.info('router::defaultAction() -> page rendered', {
            page: that.app.page
          });

          NProgress.done();
          that.app.trigger('page-rendered', that.app.page);
        })
          .catch(function(e) {
            L.error(e);
          });
      });
    }
  };

  Router.prototype.execute = function(callback, args, name) {
    if (this.app && this.app.page && this.app.page.onClosing && this.app.page.onClosing(this, callback, args, name) === false) {
      if (this.app.page.options.hash) {
        this.navigate(this.app.page.options.hash, {trigger: false});
      }
      return false;
    }
    return Super.prototype.execute.apply(this, arguments);
  };

  Router.prototype.parseUrlParams = function(url) {
    if (!url) {
      url = window.location.hash;
    }
    var parts = url.split('/');
    var params = {};

    if (parts.length > 2) {
      var i;
      for (i = 2; i < parts.length; i += 2) {
        params[parts[i]] = decodeURIComponent(parts[i + 1]);
      }
    }
    return params;
  };

  Router.prototype.start = function() {
    Backbone.history.start();
  };


  return Router;
});
