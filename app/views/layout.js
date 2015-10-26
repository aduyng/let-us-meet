'use strict';
define(function(require) {
  var Super = require('views/base'),
    _ = require('underscore'),
    Boostrap = require('bootstrap'),
    Toastr = require('toastr'),
    B = require('bluebird'),
    moment = require('moment'),
    L = require('logger'),
    Template = require('hbs!views/layout.tpl');

  var View = Super.extend({
    el: 'body'
  });

  View.prototype.initialize = function(options) {
    Super.prototype.initialize.call(this, options);

    if (!options.app) {
      throw new Error('app must be passed!');
    }

    this.app = options.app;
    this.toast = Toastr;
    this.toast.options = {
      'closeButton': true,
      'debug': false,
      'positionClass': 'toast-bottom-right',
      'onclick': null,
      'showDuration': '300',
      'hideDuration': '1000',
      'timeOut': '5000',
      'extendedTimeOut': '1000',
      'showEasing': 'swing',
      'hideEasing': 'linear',
      'showMethod': 'fadeIn',
      'hideMethod': 'fadeOut'
    };

    this.app.on('page-loaded', this.onPageLoaded.bind(this));

    var lazyLayout = _.debounce(this.adjustPageHeight.bind(this), 300);
    $(window).resize(lazyLayout);
  };

  View.prototype.isBrowserCompatible = function() {
    var requiredFeatures = 'js canvas hashchange draganddrop localstorage svg';
    var html = $('html');
    return _.filter(requiredFeatures.split(' '), function(cls) {
      return !html.hasClass(cls);
    });
  };

  View.prototype.render = function() {
    var that = this;

    that.$el.html(Template({
      id: that.id,
      name: window.config.fullName,
      version: window.config.version
    }));

    that.mapControls();
    that.controls.container = $('#container');
    that.controls.mainContent = $('#main-content');
    that.controls.mainContent.css({
      minHeight: that.getMaxContainerHeight() + 'px'
    });


    var missingFeatures = that.isBrowserCompatible();
    if (!_.isEmpty(missingFeatures)) {
      L.warn('Missing features: ' + missingFeatures.join(', '));
      var message = window.app.translator.get('We\'ve detected that your browser is not compatible with our application. Some parts of the application might perform incorrectly. Please go <a target="_blank" href="//browsehappy.com/">http://browsehappy.com</a> to update your browser.');
      that.showMessage(message, {
        classes: 'alert-danger'
      });
    } else if (!_.isEmpty(window.config.systemMessage)) {
      that.showMessage(window.config.systemMessage, {
        classes: 'alert-danger'
      });
    }

    var events = {};
    events['click [data-help-text]'] = 'onHelpClick';
    this.delegateEvents(events);

    return B.resolve();
  };

  View.prototype.onHelpClick = function(event) {
    event.preventDefault();
    event.stopPropagation();

    var e = $(event.currentTarget);
    if (this.currentPopoverElement && !this.currentPopoverElement.is(event.currentTarget)) {
      this.currentPopoverElement.popover('hide');
    }
    this.currentPopoverElement = e;

    if (!e.data('has-help-popover')) {
      e.popover({
        content: e.data('help-text'),
        html: true,
        trigger: 'click'
      });
      e.data('has-help-popover', true);
      e.popover('show');
    }
  };

  View.prototype.onPageLoaded = function() {
    this.adjustPageHeight();
  };

  View.prototype.adjustPageHeight = function() {
    var maxHeight = this.getMaxContainerHeight();
    if (maxHeight > this.controls.mainPanel.height()) {
      this.controls.mainPanel.css({
        minHeight: maxHeight
      });
    }
  };
  View.prototype.getMaxContainerHeight = function() {
    return $(window).height() - 70;
  };

  View.prototype.showMessage = function(message, options) {
    var that = this;
    var opts = _.extend({
      classes: 'alert-warning'
    }, options);
    if (_.isEmpty(message)) {
      that.controls.message.addClass('hidden');
      return false;
    }

    that.controls.message.html(message).attr('class', 'alert system-message ' + opts.classes);
    $('html').addClass('has-system-message');
    return true;
  };


  return View;
});
