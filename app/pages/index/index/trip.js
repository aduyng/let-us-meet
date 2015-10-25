'use strict';
define(function(require) {
  var Super = require('views/base'),
    TEMPLATE = require('hbs!./trip.tpl');

  var View = Super.extend({});


  View.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId(),
      trip: this.model.toJSON()
    }));
  };

  return View;
});
