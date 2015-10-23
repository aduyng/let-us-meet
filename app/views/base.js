'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    _ = require('underscore'),
    S = require('underscore.string'),
    B = require('bluebird'),
    L = require('logger'),
    btnWait = require('btn-wait'),
    transit = require('transit'),
    FormValidation = require('formValidation'),
    Super = Backbone.View;

  function getGUID() {
    if (!window.guid) {
      window.guid = 0;
    }
    window.guid++;
    return 'uid' + '-' + window.guid;
  }

  var View = Super.extend({});
  View.spinnerOptions = {
    //lines    : 13, // The number of lines to draw
    //length   : 24, // The length of each line
    //width    : 11, // The line thickness
    //radius   : 9, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#FFCCBC', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };

  View.prototype.initialize = function(options) {
    options = options || {};
    options.id = options.id || getGUID();

    Super.prototype.initialize.call(this, options);
    if (!this.id) {
      this.id = options.id;
    }
    if (!this.options) {
      this.options = options;
    }
    this.controls = {};
    this.children = {};
    this.parent = options.parent;

    if (options.toast) {
      this.toast = options.toast;
    }

    if (!this.toast && window.app && window.app.page && window.app.page.toast) {
      this.toast = window.app.page.toast;
    }
    this.translator = options.translator;
    if (!this.translator && window.app && window.app.translator) {
      this.translator = window.app.translator;
    }
  };

  View.prototype.render = function() {
    var that = this;
    return B.resolve(this.draw())
      .then(function() {
        B.resolve(that.mapControls());
      })
      .then(function() {
        B.resolve(that.initEvents());
      })
      .then(function() {
        that.trigger('rendered');
      });
  };

  View.prototype.draw = function() {
    return B.resolve();
  };

  View.prototype.initEvents = function() {
    return B.resolve();
  };

  View.prototype.print = function(isPrint) {
    return B.resolve(_.map(this.children || {}, function(child) {
      if (child.print) {
        return B.resolve(child.print(isPrint));
      }
      return B.resolve();
    }));
  };

  View.prototype.mapControls = function() {
    _.forEach(this.$el.find('[id]'), function(element) {
      var e = $(element);
      if (!e.attr('name')) {
        e.attr('name', e.attr('id'));
      }
      this.controls[S.camelize(e.attr('id').replace(this.id + '-', ''))] = e;
    }, this);
  };

  View.prototype.toJSON = function() {
    var serializedData = {};
    _.forEach(this.$el.find('.' + this.getId('field')), function(element) {
      var e = $(element);
      var val;
      if (e.is('.radio-group')) {
        val = e.find('input[name=' + e.attr('id') + ']:checked').val();
      }
      else if (e.is('input[type=checkbox]') || e.is('input[type=radio]')) {
        val = e.is(':checked');
      }
      else{
        val = e.val();
      }
      serializedData[S.camelize(e.attr('id').replace(this.id + '-', ''))] = val;
    }, this);
    return serializedData;
  };

  View.prototype.serialize = function() {
    return this.toJSON();
  };

  View.prototype.getId = function(suffix) {
    var id = this.id || this.options.id;
    if (!_.isEmpty(suffix)) {
      id += '-' + suffix;
    }
    return id;
  };


  View.prototype.isValid = function() {
    if (this.validatorContainer) {
      this.validatorContainer.data('formValidation').validate();
      return this.validatorContainer.data('formValidation').isValid();
    }
    return true;
  };

  View.prototype.initValidators = function(options, container) {
    this.validatorContainer = (container || this.$el);
    /*eslint-disable*/
    try {
      this.validatorContainer.formValidation('destroy');
    } catch (ignore) {

    }
    /*eslint-enable */

    this.validatorContainer.formValidation(_.extend({
      framework: 'bootstrap',
      icons: {
        valid: 'fa fa-check-circle',
        invalid: 'fa fa-exclamation-circle',
        validating: 'fa fa-circle-o-notch fa-spin'
      },
      live: true,
      message: window.app.translator.get('This value is not valid')
    }, options));
  };

  View.prototype.find = function(selector) {
    return this.$el.find(selector);
  };

  View.prototype.toId = function(name) {
    return '#' + this.getId(name);
  };

  View.prototype.toClass = function(name) {
    return '.' + this.getId(name);
  };

  View.prototype.findByClass = function(cls) {
    return this.find(this.toClass(cls));
  };

  View.prototype.findById = function(id) {
    return this.find(this.toId(id));
  };


  return View;
});
