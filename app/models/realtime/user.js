'use strict';
define(function(require) {
  var Super = require('./base'),
    RealtimeTrips = require('collections/realtime/trip'),
    RealtimeTrip = require('models/realtime/trip'),
    RealtimeParticipants = require('collections/realtime/participant');

  var Model = Super.extend({
    name: 'users',
    autoSync: true
  });

  Model.prototype.getRealtimeTrips = function(userId) {
    var me = this;
    var Collection = RealtimeTrips.extend({
      url: window.config.firebase.url + ['users', userId || me.id, 'trips'].join('/')
    });
    return new Collection();
  };

  Model.prototype.getRealtimeTrip = function(tripId, userId) {
    var me = this;
    var Trip = RealtimeTrip.extend({
      urlRoot: window.config.firebase.url + ['users', userId || me.id, 'trips'].join('/')
    });
    var trip = new Trip({
      id: tripId
    });
    return trip;
  };

  Model.prototype.getRealtimeParticipants = function(tripId, userId) {
    var me = this;
    var Collection = RealtimeParticipants.extend({
      url: window.config.firebase.url + ['users', userId || me.id, 'trips', tripId, 'participants'].join('/')
    });
    return new Collection();
  };

  return Model;
});
