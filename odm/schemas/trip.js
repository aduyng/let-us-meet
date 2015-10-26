'use strict';
var env = process.env.NODE_ENV || 'development',
  config = require('./../../config'),
  B = require('bluebird'),
  odm = require('../odm'),
  L = require('./../../logger'),
  moment = require('moment'),
  _ = require('underscore'),
  extend = require('mongoose-schema-extend'),
  User = require('../models/user'),
  Super = require('./base');


var Schema = Super.extend({
  name: {
    type: String,
    trim: true,
    required: true
  },
  userId: {
    type: String,
    trim: true,
    required: true
  },
  attendees: {
    type: odm.Schema.Types.Mixed
  },
  dateOfTravel: {
    type: Number,
    required: true,
    default: moment().valueOf()
  },
  destination: {
    type: odm.Schema.Types.Mixed
  }
});

Schema.methods.export = function(viewer) {
  var me = this;
  var data = me.toJSON();
  var tripAttendees = data.attendees || {};
  var attendeeIds = [].concat(_.keys(tripAttendees));
  return User.findAsync({
    userId: {$in: attendeeIds}
  })
    .then(function(attendees) {
      _.each(attendees, function(attendee) {
        _.extend(tripAttendees[attendee.userId], _.pick(attendee, 'name', 'coords'))
      });

      return _.extend(me.toJSON(), {
        attendees: tripAttendees
      });
    });
};

module.exports = Schema;