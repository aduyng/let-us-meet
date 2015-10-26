'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    B = require('bluebird'),
    Participants = require('collections/participant');

  var Model = Backbone.Model.extend({});

  Model.getRandomId = function() {
    return new ObjectId().toString();
  };

  Model.prototype.getParticipants = function(force) {
    var me = this;
    if (!this.participants || force === true) {
      this.participants = new Participants();
      return B.resolve(this.participants.fetch({
        tripId: this.id
      }))
        .then(function() {
          return B.all(me.participants.map(function(participant) {
            return participant.getUser();
          }));
        })
        .then(function() {
          return me.participants;
        })

    }
    return B.resolve(this.participants);

  };

  return Model;
});
