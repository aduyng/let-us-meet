'use strict';
define(function(require) {

  var Super = require('../base'),
    Backbone = require('backbone'),
    _ = require('underscore'),
    TEMPLATE = require('hbs!./dialog.tpl');

  var View = Super.extend({
    className: 'modal fade'
  });
  View.zIndex = 0;

  View.prototype.initialize = function(options) {
    var that = this;

    Super.prototype.initialize.call(that, options);

    if (!options.buttons) {
      that.buttons = new Backbone.Collection();
      that.buttons.add({
        id: 'ok',
        label: 'OK',
        iconClass: 'fa fa-check-circle',
        buttonClass: 'btn-primary',
        align: 'left'
      });

      that.buttons.add({
        id: 'cancel',
        label: 'Cancel',
        iconClass: 'fa fa-times',
        buttonClass: 'btn-default',
        align: 'left',
        autoClose: true
      });
    }
    else{
      that.buttons = (options.buttons instanceof Backbone.Collection) ? options.buttons : new Backbone.Collection(options.buttons);
    }

    //make sure that required attributes are passed in all buttons
    that.buttons.forEach(function(button, index) {
      if (!button.id) {
        throw new Error('Button ' + index + ' does not have an id!');
      }
    });


    if (this.options.autoOpen !== false) {
      this.open();
    }
    if( that.zIndex === undefined) {
      this.zIndex = View.zIndex = View.zIndex + 2;
    }
  };

  View.prototype.open = function() {
    var that = this;
    if( that.zIndex === undefined) {
      that.zIndex = View.zIndex = View.zIndex + 2;
    }

    this.$el.html(TEMPLATE({
      id: this.getId(),
      sizeClass: this.options.sizeClass || '',
      title: this.options.title || '',
      headerClass: this.options.title ? '' : 'hidden',
      leftButtons: _.map(
        that.buttons.filter(function(button) {
          return !button.get('align') || button.get('align') === 'left';
        }), function(button) {
          return button.toJSON();
        }),
      rightButtons: _.map(
        that.buttons.filter(function(button) {
          return button.get('align') === 'right';
        }), function(button) {
          return button.toJSON();
        })
    }));
    this.mapControls();

    //render body
    var msg = this.options.body || this.options.message || '';

    if (msg) {
      if (msg instanceof Super) {
        msg.render();
        msg.$el.appendTo(this.controls.body);
      }
      else{
        this.controls.body.html(msg);
      }
    }

    this.$el.appendTo($('body'));

    this.$el.on('show.bs.modal', function(event) {
      var e = $(event.target);
      var modalBody = e.find('.modal-body');
      modalBody.css('overflow-y', 'auto');
      modalBody.css('max-height', $(window).height() * 0.8);
    });

    this.$el.on('shown.bs.modal', function() {
      if (this.options.body && this.options.body instanceof Super && this.options.body.focus) {
        this.options.body.focus();
      }
      that.$el.next().css({'z-index': 1040 + that.zIndex, height: $(document).outerHeight()});
      that.$el.css('z-index', 1040 + that.zIndex + 1);

    }.bind(this));

    this.$el.on('hidden.bs.modal', function() {
      this.remove();
      View.zIndex -= 2;
      if($('.modal').length > 0) {
        $('body').addClass('modal-open');
      }
    }.bind(this));

    var events = {};
    events['click ' + that.toClass('button')] = 'onButtonClickHandler';
    this.delegateEvents(events);

    this.$el.modal({
      keyboard: true,
      show: true,
      backdrop: 'static'
    });
    this.listenToOnce(window.app, 'page-rendered', function() {
      that.close();
    });
  };

  View.prototype.onButtonClickHandler = function(event) {
    var that = this;
    event.preventDefault();
    var e = $(event.currentTarget);
    var model = that.buttons.get(e.data('id'));

    that.trigger(model.id, _.extend({}, event, {model: model, sender: e}));
    if (model.get('autoClose')) {
      that.close();
    }
  };


  View.prototype.close = function() {
    this.$el.modal('hide');
    this.stopListening(window.app, 'page-rendered');
  };

  Object.defineProperty(View.prototype, 'body', {
    get: function() {
      if (this.options.body instanceof Super) {
        return this.options.body;
      }
      return this.controls.body;
    }
  });

  //region alert
  View.alert = function(message, buttons) {
    var options = {
      message: message,
      buttons: buttons
    };
    if (!options.buttons) {
      options.buttons = new Backbone.Collection();
      options.buttons.add({
        id: 'ok',
        label: 'OK',
        iconClass: 'fa fa-check-circle',
        buttonClass: 'btn-primary',
        align: 'left',
        autoClose: true
      });
    }
    return new View(options);
  };

  //endregion


  return View;
});
