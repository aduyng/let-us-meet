'use strict';
define(function(require) {
  var Super = require('views/page'),

    Template = require('hbs!./index.tpl');

  var Page = Super.extend({});

  Page.prototype.initialize = function(options) {
    //super(options)
    Super.prototype.initialize.call(this, options);
  };

  Page.prototype.render = function() {
    this.$el.html(Template({
      id: this.id,
      code: this.options.params.code,
      message: decodeURIComponent(this.options.params.message)
    }));

    this.mapControls();

    var events = {};
    events['click ' + this.toId('back')] = 'onBackClick';
    this.delegateEvents(events);

    this.ready();
  };


  return Page;


});
