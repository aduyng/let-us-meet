'use strict';
define(function(require) {
  var Super = require('views/base'),
    Dialog = require('views/controls/dialog'),
    Trip = require('models/trip'),
    B = require('bluebird'),
    TripView = require('./trip'),
    TEMPLATE = require('hbs!./trips.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function() {
    Super.prototype.initialize.apply(this, arguments);
    this.collection.on('add remove', this.draw.bind(this));
  };

  View.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId(),
      trips: this.collection.toJSON()
    }));
  };

  View.prototype.initEvents = function() {
    var events = {};
    events['click ' + this.toId('new')] = 'onNewTripClick';
    events['click ' + this.toClass('trip')] = 'onTripClick';
    this.delegateEvents(events);
  };
  View.prototype.onTripClick = function(event) {
    var e = $(event.currentTarget);
    var trip = this.collection.get(e.data('id'));
    this.trigger('trip-click', _.extend(event, {
      trip: trip
    }));
  };
  View.prototype.onNewTripClick = function() {
    var me = this;
    var trip = new Trip();
    var view = new TripView({
      model: trip
    });

    var dlg = new Dialog({
      body: view,
      buttons: [{
        id: 'create',
        label: me.translator.get('Create'),
        iconClass: 'fa fa-plus-circle',
        buttonClass: 'btn-success',
        align: 'left'
      }, {
        id: 'cancel',
        label: me.translator.get('Cancel'),
        iconClass: 'fa fa-times',
        buttonClass: 'btn-default',
        align: 'left',
        autoClose: true
      }]
    });

    dlg.on('create', function() {
      return B.resolve(trip.save(view.toJSON()))
        .then(function() {
          me.collection.add(trip);
          dlg.close();
        })
        .catch(function() {
          window.app.layout.toast.error(me.translator.get('Unable to create trip. Please check your input and try again.'));
        });
    });
  };

  return View;
});
