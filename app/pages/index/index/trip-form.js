'use strict';
define(function(require) {
  var Super = require('views/base'),
    moment = require('moment'),
    TEMPLATE = require('hbs!./trip-form.tpl');

  var View = Super.extend({});


  View.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId(),
      trip: this.model.toJSON()
    }));
  };

  View.prototype.initEvents = function() {
    var events = {};
    this.delegateEvents(events);
  };


  View.prototype.toJSON = function() {
    var data = Super.prototype.toJSON.apply(this, arguments);
    data.dateOfTravel = moment(data.dateOfTravel).valueOf();
    return data;
  };


  return View;
});
