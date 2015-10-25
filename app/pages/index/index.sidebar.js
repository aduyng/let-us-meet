'use strict';
define(function(require) {
  var Super = require('views/base'),
    B = require('bluebird'),
    FB = require('fb'),
    geolocator = require('geolocator'),
    Trips = require('collections/trip'),
    TEMPLATE = require('hbs!./index.sidebar.tpl'),
    TRIPS = require('hbs!./index.sidebar.trips.tpl'),
    TRIP = require('hbs!./index.sidebar.trip.tpl'),
    ACCOUNT = require('hbs!./index.sidebar.account.tpl'),
    Dialog = require('views/controls/dialog'),
    Trip = require('models/trip'),
    AttendeesView = require('./index/attendees'),
    TripView = require('./index/trip'),
    TripsView = require('./index/trips');

  var Sidebar = Super.extend({});

  Sidebar.prototype.initialize = function() {
    Super.prototype.initialize.apply(this, arguments);
    this.trips = new Trips();
  };

  Sidebar.prototype.render = function() {
    var me = this;
    return B.resolve(me.draw())
      .then(function() {
        B.resolve(me.mapControls());
      })
      .then(function() {
        B.resolve(me.initEvents());
      })
      .then(function() {
        //fetching the trips from backend
        return B.resolve(me.trips.fetch({
          userId: window.app.session.getUser().id
        }))
          .then(function() {
            me.controls.account.html(ACCOUNT({
              id: me.getId(),
              user: _.extend(window.app.session.getUser().toJSON(), {
                avatarUrl: window.app.session.getUser().getAvatarUrl()
              })
            }));

            me.renderTrips();

            if (window.app.page.params.trip) {
              me.displayTrip(me.trips.get(window.app.page.params.trip));
            } else {
              me.controls.trips.removeClass('hidden');
            }
          });
      })
      .then(function() {
        me.trigger('rendered');
      });
  };

  Sidebar.prototype.renderTrips = function() {
    var me = this;
    me.children.trips = new TripsView({
      el: me.controls.trips,
      collection: me.trips
    });
    me.children.trips.on('trip-click', this.onTripClick.bind(me));
    me.children.trips.render();
  };

  Sidebar.prototype.onBackToTripListClick = function(event) {
    window.app.router.navigate('index/index', {trigger: false});

    //show the list of trips
    this.controls.trips.removeClass('hidden');
    this.controls.trip.empty().addClass('hidden');
  };

  Sidebar.prototype.onTripClick = function(event, trip) {
    this.displayTrip(event.trip);
  };

  Sidebar.prototype.displayTrip = function(trip) {
    window.app.router.navigate('index/index/trip/' + trip.id, {trigger: false});

    //hide the list of trips
    this.controls.trips.addClass('hidden');

    this.controls.trip.html(TRIP({
      id: this.getId(),
      trip: trip.toJSON()
    }))
      .removeClass('hidden');

    var attendees = new AttendeesView({
      el: this.findById('attendees'),
      model: trip
    });
    attendees.render();

    this.controls.trip.find(this.toId('back-to-trip-list')).click(this.onBackToTripListClick.bind(this));

    this.trigger('trip-click', {
      trip: trip
    });
  };

  Sidebar.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId()
    }));
  };

  Sidebar.prototype.initEvents = function() {
    var events = {};
    events['click ' + this.toId('detect-location')] = 'onDetectLocationClick';
    this.delegateEvents(events);
  };

  Sidebar.prototype.onDetectLocationClick = function(e) {
    this.detectLocation();
  };

  Sidebar.prototype.detectLocation = function() {
    var me = this;
    return new B(function(resolve, reject) {
      geolocator.locate(resolve, reject, true);
    })
      .then(function(location) {
        if (location) {
          var user = window.app.session.getUser();

          return B.resolve(user.save({
            location: location
          }));
        }
      })
      .then(function() {
        me.render();
      });
  };

  return Sidebar;
});
