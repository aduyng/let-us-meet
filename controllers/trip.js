'use strict';
var config = require('../config'),
  _ = require('underscore'),
  S = require('underscore.string'),
  U = require('../utils'),
  B = require('bluebird'),
  L = require('../logger'),
  User = require('../odm/models/user'),
  Trip = require('../odm/models/trip');


exports.list = function(req, res, next) {
  Trip.findAsync({
    userId: req.session.userId
  }, {
    name: 1
  })
    .then(function(trips) {
      //if (_.isEmpty(trips)) {
      return res.send(trips);
      //}
      //trips = _.reduce(trips, function(memo, trip) {
      //  var tripId = Trip.toHexString(trip._id);
      //  memo[tripId] = trip;
      //  return memo;
      //}, {});
      //
      ////extract all trip attendees
      //var userIds = _.reduce(trips, function(memo, trip, tripId) {
      //  if (!memo[trip.userId]) {
      //    memo[trip.userId] = {};
      //  }
      //  memo[trip.userId][tripId] = true;
      //  return _.reduce(trip.attendees || [], function(keep, attendee, attendeeId) {
      //    if (!keep[attendeeId]) {
      //      keep[attendeeId] = {};
      //    }
      //    keep[attendeeId][tripId] = true;
      //    return keep;
      //  }, memo);
      //}, {});
      //
      //return User.findAsync({
      //  userId: {
      //    $in: _.keys(userIds)
      //  }
      //}, {
      //  userId: 1,
      //  name: 1,
      //  coords: 1
      //})
      //  .then(function(users) {
      //    var uniqueUsers = _.unique(users, function(user) {
      //      return user.userId;
      //    });
      //
      //    _.forEach(uniqueUsers, function(user) {
      //      var tripIds = userIds[user.userId];
      //      _.forEach(tripIds, function(ignore, tripId) {
      //        if (!trips[tripId].attendees) {
      //          trips[tripId].attendees = {};
      //        }
      //        if (!trips[tripId].attendees[user.userId]) {
      //          trips[tripId].attendees[user.userId] = {};
      //        }
      //        _.extend(trips[tripId].attendees[user.userId], _.pick(user, 'name', 'coords'));
      //      })
      //    });
      //    res.send(_.map(trips, function(trip) {
      //      return _.extend(trip.toJSON());
      //    }));
      //  });
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};

exports.create = function(req, res, next) {
  var trip = new Trip(_.extend({}, _.pick(req.body, 'name', 'dateOfTravel', 'destination', 'attendees'), {
    userId: req.session.userId
  }));
  trip.saveAsync()
    .spread(function(trip) {
      return trip.export();
    })
    .then(function(exported) {
      res.send(exported);
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};

exports.read = function(req, res, next) {
  Trip.findByIdAsync(req.params.id)
    .then(function(trip) {
      return trip.export();
    })
    .then(function(exported) {
      res.send(exported);
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};

exports.update = function(req, res, next) {
  Trip.findByIdAsync(req.params.id)
    .then(function(trip) {
      _.extend(trip, _.pick(req.body, 'attendees', 'name', 'dateOfTravel', 'destination'));
      return trip.saveAsync();
    })
    .spread(function(trip) {
      return trip.export();
    })
    .then(function(exported) {
      res.send(exported);
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};


exports.invite = function(req, res, next) {
  Trip.findByIdAsync(req.params.id)
    .then(function(trip) {
      res.render('invite', {
        config: config,
        trip: trip
      });
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};

exports.delete = function(req, res, next) {
  Trip.findByIdAsync(req.params.id)
    .then(function(trip) {
      return trip.removeAsync();
    })
    .then(function() {
      res.send({count: 1});
    })
    .catch(function(e) {
      U.sendError(e, req, res, next);
    });
};
