'use strict';
define(function(require) {
  var Super = require('views/base'),
    B = require('bluebird'),
    FB = require('fb'),
    geolocator = require('geolocator'),
    Trips = require('collections/trip'),
    Trip = require('models/trip'),
    TEMPLATE = require('hbs!./sidebar.tpl'),
    AttendeeListPanelView = require('./attendees-panel'),
    TripPanelView = require('./trip-panel'),
    AccountPanelView = require('./account-panel'),
    ItineraryPanelView = require('./itinerary-panel'),
    TripListPanelView = require('./trip-list-panel');

  var Sidebar = Super.extend({});

  Sidebar.prototype.render = function() {
    var me = this;
    return Super.prototype.render.apply(this, arguments)
      .then(function() {
        me.renderAccountInfo();
        me.renderTrips();

      });
  };

  Sidebar.prototype.renderAccountInfo = function() {
    var me = this;
    me.children.account = new AccountPanelView({
      el: me.controls.account
    });
    me.children.account.on('relocate', me.onRelocateClick.bind(me));
    me.children.account.render();
  };

  Sidebar.prototype.onRelocateClick = function(){
    this.trigger('relocate');
  };

  Sidebar.prototype.renderTrips = function() {
    var me = this;
    me.children.trips = new TripListPanelView({
      el: me.controls.trips
    });
    me.children.trips.on('trip-click', this.onTripClick.bind(me));
    me.children.trips.render();
  };

  Sidebar.prototype.onBackToTripListClick = function(event) {
    window.app.router.navigate('index/index', {trigger: false});

    //show the list of trips
    this.controls.trips.removeClass('hidden');
    this.children.trip && this.children.trip.remove();
    this.children.attendees && this.children.attendees.remove();
    //this.children.itinerary && this.children.itinerary.remove();
    this.controls.tripPanels.addClass('hidden');
    this.trigger('show-trip-list');
  };

  Sidebar.prototype.onTripClick = function(event) {
    //window.app.trip = window.app.trips.getTrip(event.trip.id);
    //this.displayTrip(event.trip.id);
    this.trigger('trip-click', event);
  };

  Sidebar.prototype.displayTrip = function() {
    //request for the trip details
    var trip = window.app.trip;

    //hide the list of trips
    this.controls.trips.addClass('hidden');

    this.children.trip = new TripPanelView({});
    this.children.trip.on('trip-deleted', this.onTripDeleted.bind(this));
    this.children.trip.render();
    this.controls.trip.append(this.children.trip.$el);

    this.children.attendees = new AttendeeListPanelView({});
    this.children.attendees.render();
    this.controls.attendees.append(this.children.attendees.$el);

    //var isJoined = (trip.get('attendees') || {})[window.app.user.id] !== undefined;
    //
    //if (isJoined) {
    //  this.children.itinerary = new ItineraryPanelView({
    //    model: trip
    //  });
    //
    //  this.children.itinerary.render();
    //  this.children.itinerary.on('origin-airport-selected', this.onOriginAirportSelected.bind(this));
    //  this.children.itinerary.on('destination-airport-selected', this.onDestinationAirportSelected.bind(this));
    //  this.controls.itinerary.append(this.children.itinerary.$el);
    //
    //}

    this.controls.tripPanels.removeClass('hidden');

    this.trigger('show-trip', {
      trip: trip
    });
  };

  Sidebar.prototype.onOriginAirportSelected = function(e) {
    this.trigger('origin-airport-selected', {
      trip: e.trip
    });
  };

  Sidebar.prototype.onDestinationAirportSelected = function(e) {
    this.trigger('destination-airport-selected', {
      trip: e.trip
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
    events['click ' + this.toId('back-to-trip-list')] = 'onBackToTripListClick';
    this.delegateEvents(events);
  };

  Sidebar.prototype.onTripDeleted = function(e) {
    this.trigger('trip-delete');
    this.onBackToTripListClick();
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
          var user = window.app.user;

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
