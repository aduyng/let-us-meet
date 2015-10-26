'use strict';
define(function(require) {
  var Super = require('views/base'),
    TEMPLATE = require('hbs!./account-panel.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function() {
    Super.prototype.initialize.apply(this, arguments);
    this.boundDraw = this.draw.bind(this);
    this.model = window.app.user;
    this.model.on('all', this.boundDraw);
  };

  View.prototype.remove = function() {
    this.model.off('all', this.boundDraw);
    Super.prototype.remove.apply(this, arguments);
  };

  View.prototype.initEvents = function() {
    var events = {};
    events['click ' + this.toId('relocate')] = 'onRelocateClick';
    this.delegateEvents(events);
  };

  View.prototype.onRelocateClick = function(event) {
    this.trigger('relocate');
  };


  View.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId(),
      user: this.model.toJSON()
    }));
  };

  return View;
});
