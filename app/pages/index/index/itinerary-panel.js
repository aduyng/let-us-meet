'use strict';
define(function(require) {
  var Super = require('views/base'),
    moment = require('moment'),
    numeral = require('numeral'),
    B = require('bluebird'),
    Select2 = require('select2'),
    Sabre = require('models/sabre'),
    TEMPLATE = require('hbs!./itinerary-panel.tpl');

  var View = Super.extend({});


  View.prototype.draw = function() {
    var id = window.app.user.id;
    this.$el.html(TEMPLATE({
      id: this.getId(),
      itinerary: _.find(this.model.get('attendees'), function(attendee) {
        return attendee.id === id;
      })
    }));

    return B.all([this.renderOriginAirports(), this.renderDestinationAirports(), this.displayLowestFare()]);
  };

  View.prototype.renderOriginAirports = function() {
    var coords = window.app.user.get('coords');
    var me = this;
    Sabre.getInstance().geoSearchAirportByCoordinates(coords.latitude, coords.longitude)
      .then(function(airports) {
        me.fromAirports = airports;
        me.findById('from').select2({
          placeholder: window.app.translator.get('Select origin airport'),
          allowClear: false,
          data: _.map(airports, function(airport) {
            return {
              id: airport.id,
              text: airport.id + ' - ' + airport.name
            };
          })
        })
      });
  };

  View.prototype.renderDestinationAirports = function() {

    var coords = this.model.get('destination').coords;

    var me = this;
    Sabre.getInstance().geoSearchAirportByCoordinates(coords.latitude, coords.longitude)
      .then(function(airports) {
        me.toAirports = airports;
        me.findById('to').select2({
          placeholder: window.app.translator.get('Select destination airport'),
          allowClear: false,
          data: _.map(airports, function(airport) {
            return {
              id: airport.id,
              text: airport.id + ' - ' + airport.name
            };
          })
        })
      });
  };

  View.prototype.initEvents = function() {
    var events = {};
    events['change ' + this.toId('from')] = 'onFromChange';
    events['change ' + this.toId('to')] = 'onToChange';
    this.delegateEvents(events);
  };

  View.prototype.onFromChange = function() {
    var attendees = this.model.get('attendees') || [];
    var airportId = this.controls.from.val();
    var me = this;
    var id = window.app.user.id;
    _.every(attendees || [], function(attendee, index) {
      if (attendee.id === id) {
        attendees[index].from = _.find(me.fromAirports, function(airport) {
          return airport.id === airportId;
        });
        return false;
      }
      return true;
    });

    this.model.set('attendees', attendees);
    return B.resolve(this.model.save())
      .then(function() {
        me.trigger('origin-airport-selected', {
          trip: me.model
        });
        return me.displayLowestFare();
      });
  };

  View.prototype.onToChange = function() {
    var attendees = this.model.get('attendees') || [];
    var airportId = this.controls.to.val();
    var me = this;
    var id = window.app.user.id;
    _.every(attendees || [], function(attendee, index) {
      if (attendee.id === id) {
        attendees[index].to = _.find(me.toAirports, function(airport) {
          return airport.id === airportId;
        });
        return false;
      }
      return true;
    });

    this.model.set('attendees', attendees);
    return B.resolve(this.model.save())
      .then(function() {
        me.trigger('destination-airport-selected', {
          trip: me.model
        });
        return me.displayLowestFare();
      });
  };

  View.prototype.displayLowestFare = function() {
    var me = this;
    var id = window.app.user.id;
    var itinerary = _.find(this.model.get('attendees'), function(attendee) {
      return attendee.id === id;
    });

    if (itinerary.from && itinerary.to) {
      return B.resolve(Sabre.getInstance().findLowestFare(itinerary.from, itinerary.to))
        .then(function(fare) {
          me.findById('price').text(numeral(fare.price).format('$0,0'));
        });
    }

  };

  return View;
});
