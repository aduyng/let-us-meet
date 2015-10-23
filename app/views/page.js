'use strict';
define(function(require) {
  var _ = require('underscore'),
    Super = require('./base'),
    B = require('bluebird'),
    L = require('logger'),
    Dialog = require('views/controls/dialog');
  require('btn-wait');
  var Page = Super.extend({});


  Page.prototype.initialize = function(options) {
    //super(options)
    Super.prototype.initialize.call(this, options);

    this.app = options.app;
    this.layout = options.app.layout;
    this.router = options.app.router;
    this.session = options.app.session;
    this.socket = options.app.socket;
    this.config = window.app.config;
    this.params = options.params;
    this.user = this.session.getUser();
    this.toast = options.toast;
    this.firebase = window.app.firebase;

    this.bindedOnWindowBeforeUnload = this.onWindowBeforeUnload.bind(this);
    $(window).on('beforeunload', this.bindedOnWindowBeforeUnload);
  };

  Page.prototype.start = function() {
    this.trigger('start');
    return B.resolve();
  };

  Page.prototype.render = function(force) {
    var that = this;
    return Super.prototype.render.apply(this, arguments)
      .then(function() {
        that.ready();
      });

  };

  Page.prototype.ready = function() {
    L.debug('views/page::ready()');
    this.trigger('ready');
    return B.resolve();
  };

  Page.prototype.cleanUp = function() {
    $(window).off('beforeunload', this.bindedOnWindowBeforeUnload);
  };

  Page.prototype.close = function() {
    _.each(this.children || {}, function(child) {
      if (child.remove) {
        /*eslint-disable*/
        try {
          child.off();
          child.remove();
        }
        catch (ignore) {
        }
        /*eslint-enable*/
      }
    });

    this.cleanUp();

    this.undelegateEvents();
    this.$el.empty();
  };

  Page.prototype.onWindowBeforeUnload = function(e) {
    if (this.hasChanged() && !window.app.session.get('isRecentlyImpersonated')) {
      var confirmationMessage = this.getUnsavedDocumentNoticeMessage();

      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
  };

  Page.prototype.getUnsavedDocumentNoticeMessage = function() {
    return this.translator.get('It looks like you have changes something on this page. If you leave before saving, your changes will be lost!');
  };

  Page.prototype.hasChanged = function() {
    return false;
  };

  Page.prototype.onClosing = function(context, callback, args) {
    var me = this;

    if (this.hasChanged()) {
      var dlg = new Dialog({
        body: this.getUnsavedDocumentNoticeMessage() + ' ' + me.translator.get('Are you sure you want to proceed?'),
        buttons: [{
          id: 'yes',
          label: window.app.translator.get('Yes'),
          iconClass: 'fa fa-arrow-left',
          buttonClass: 'btn-warning',
          align: 'left'
        }, {
          id: 'no',
          label: window.app.translator.get('No'),
          iconClass: 'fa fa-times',
          buttonClass: 'btn btn-default',
          align: 'right',
          autoClose: true
        }]
      });

      dlg.on('yes', function() {
        if (callback) {
          callback.apply(context, args);
        }
        dlg.close();
      });
      return false;
    }
    return true;
  };

  Page.prototype.reload = function(options, navOptions) {
    var params = _.extend(this.options.params, options, {rnd: new Date().valueOf()});
    var url = this.generateHash(this.options.controller, this.options.action, params);
    var navOpts = _.extend({
      trigger: true,
      replace: true
    }, navOptions);

    this.router.navigate(url, navOpts);
  };

  Page.prototype.generateHash = function(controller, action, params) {
    var parts = [controller, action];
    var keys = _.keys(params);

    _.forEach(keys, function(index) {
      var value = params[index];

      if (value !== undefined) {
        parts.push(index);
        parts.push(encodeURIComponent(value));
      }
    });
    // console.log(controller, action, params, parts);
    return parts.join('/');
  };

  Page.prototype.backButtonClickHandler = function(event) {
    event.preventDefault();
    this.back();
  };


  Page.prototype.onBackClick = function(event) {
    event.preventDefault();
    this.back();
  };

  Page.prototype.back = function() {
    if (this.backUrl) {
      this.goTo(this.backUrl, {
        trigger: true
      });
      return;
    }
    window.history.back();
  };

  Page.prototype.setBackLink = function() {
    this.session.set('backUrl', window.location.hash);
  };


  Page.prototype.goTo = function(hash, options) {
    var url = hash;

    if (_.isObject(hash)) {
      url = this.generateHash(hash.controller || this.options.controller,
        hash.action || this.options.action, _.omit(hash, 'controller', 'action'));
    }
    this.router.navigate(url, options || {
      trigger: true
    });
  };


  Page.prototype.error = function(message, title) {
    var that = this;
    var msg = 'Unknown Error!';
    var caption = 'Error!';
    return (function() {
      return new B(function(resolve, reject) {
        var show = function(m, c) {
          that.toast.error(m, c, {
            onHidden: function() {
              resolve();
            }
          });
        };

        if (_.isString(message)) {
          msg = message;
        }
        else if (message.promise) {
          var err = message.responseJSON || {};

          switch (err.type) {
            case 'ValidationError':
              msg = '<ul>' + _.map(err.data, function(value, field) {
                return '<li>' + (_.isArray(value) ? value.join(', ') : value) + '</li>';
              }).join('') + '</ul>';
              caption = err.message;
              break;
            default:
              if (_.isObject(err)) {
                msg = _.map(err, function(value, key) {
                  return value;
                }).join('<br />');
              }
          }

        }
        show(msg, caption);
      });
    })();
  };

  Page.prototype.success = function(message, title) {
    var that = this;
    var f = function() {
      return new B(function(resolve, reject) {
        that.toast.success(message, title, {
          onHidden: function() {
            resolve();
          }
        });
      });
    };
    return f();
  };

  return Page;


});
