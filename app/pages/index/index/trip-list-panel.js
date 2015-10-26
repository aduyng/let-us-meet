'use strict';
define(function(require) {
  var Super = require('views/base'),
    Dialog = require('views/controls/dialog'),
    Trip = require('models/trip'),
    B = require('bluebird'),
    TripForm = require('./trip-form'),
    Trips = require('collections/trip'),
    moment = require('moment'),
    TEMPLATE = require('hbs!./trip-list-panel.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function() {
    Super.prototype.initialize.apply(this, arguments);
    this.collection = window.app.trips;
    this.boundDraw = this.draw.bind(this);
    this.collection.on('all', this.boundDraw);
  };

  View.prototype.remove = function() {
    this.collection.off('all', this.boundDraw);
    Super.prototype.remove.apply(this, arguments);
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
    this.trigger('trip-click', {
      event: event,
      trip: trip
    });
  };

  View.prototype.onNewTripClick = function() {
    var me = this;
    var user = window.app.user;
    var participants = {};
    participants[user.id] = {
      id: user.get('id'),
      name: user.get('name'),
      coords: user.get('coords')
    };
    var trip = new Trip({
      id: Trip.getRandomId(),
      userId: user.id,
      name: window.app.translator.get('New Trip'),
      dateOfTravel: moment().add(4, 'weeks').valueOf(),
      participants: participants
    });

    var view = new TripForm({
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
      trip.set(view.toJSON());

      return B.resolve(me.collection.create(trip.toJSON()))
        .then(function() {
          dlg.close();
        })
        .catch(function() {
          window.app.layout.toast.error(me.translator.get('Unable to create trip. Please check your input and try again.'));
        });
    });
  };

  return View;
});
