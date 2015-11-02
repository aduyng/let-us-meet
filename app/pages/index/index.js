'use strict';
define(function (require) {
  var Super = require('views/page'),
    TEMPLATE = require('hbs!./index.tpl'),
    B = require('bluebird'),
    FB = require('fb'),
    Map = require('./index/map'),
    geolocator = require('geolocator'),
    _ = require('underscore'),
    User = require('models/realtime/user'),
    Trips = require('collections/trip'),
    Sidebar = require('./index/sidebar');

  var Page = Super.extend({});

  Page.prototype.render = function () {
    var me = this;
    me.toast.info(me.translator.get('Checking login status...'));
    return me.getLoginStatus()
      .then(function () {
        if (_.isEmpty(window.app.user.get('coords'))) {
          me.toast.info(me.translator.get('Detecting your location...'));
          return me.detectLocation();
        }
        return B.resolve();
      })
      .then(function () {
        window.app.trips = window.app.user.getRealtimeTrips();
      })
      .then(function () {
        var params = {
          id: me.id
        };

        me.$el.html(TEMPLATE(params));
        me.mapControls();

        return B.all([me.renderSidebar(), me.renderMap()])
          .then(function () {
            if (me.params.trip) {

              me.selectTrip(me.params.trip, me.params.user || window.app.user.id);
            }
            var events = {};
            me.delegateEvents(events);
            return me.ready();
          });
      });
  };
  Page.prototype.renderMap = function () {
    this.children.map = new Map({
      el: this.controls.map
    });
    this.children.map.on('destination-click', this.onMapDestinationClick.bind(this));
    return this.children.map.render();
  };

  Page.prototype.onMapDestinationClick = function (event) {
    window.app.trip.set('destination', event.destination);
  };

  Page.prototype.renderSidebar = function () {
    var me = this;
    this.children.sidebar = new Sidebar({
      el: this.controls.sidebar
    });
    this.children.sidebar.on('relocate', this.onRelocateClick.bind(this));
    this.children.sidebar.on('trip-click', this.onTripClick.bind(this));
    this.children.sidebar.on('trip-delete', this.onTripDelete.bind(this));
    this.children.sidebar.on('show-trip', this.onShowTrip.bind(this));
    this.children.sidebar.on('show-trip-list', this.onShowTripList.bind(this));
    this.children.sidebar.on('origin-airport-selected', this.onOriginAirportSelected.bind(this));
    this.children.sidebar.on('destination-airport-selected', this.onDestinationAirportSelected.bind(this));

    return this.children.sidebar.render();
  };

  Page.prototype.onRelocateClick = function () {
    this.detectLocation()
      .then(function () {
        if (window.app.participants) {
          var participant = window.app.participants.get(window.app.user.id);
          participant && participant.set('coords', window.app.user.get('coords'));
        }
      })
  };

  Page.prototype.onTripClick = function (event) {
    this.selectTrip(event.trip.id, window.app.user.id);
  };

  Page.prototype.onTripDelete = function () {
    window.app.trips.remove(window.app.trips.get(window.app.trip.id));
    window.app.trip.destroy();
    this.onShowTripList();
  };

  Page.prototype.selectTrip = function (tripId, userId) {
    var me = this;
    window.app.router.navigate(['index', 'index', 'trip', tripId, 'user', userId || window.app.user.id].join('/'), {
      trigger: false
    });
    return B.resolve()
      .then(function () {
        return new B(function (resolve) {
          window.app.trip = window.app.user.getRealtimeTrip(tripId, userId);
          window.app.trip.once('sync', resolve);
          window.app.trip.fetch();
        });
      })
      .then(function () {
        window.app.trip.on('sync', _.throttle(function () {
          var fromCode = (window.app.trip.destination || {}).id;
          var toCode = (window.app.trip.get('destination') || {}).id;
          
          if (toCode) {
            if (!fromCode || fromCode !== toCode) {
              window.app.trip.trigger('destination-changed');
              window.app.trip.destination = window.app.trip.get('destination');
            }
          }
          var fromKeywords = window.app.trip.keywords;
          var toKeywords = window.app.trip.get('keywords');

          if (!fromKeywords || fromKeywords !== toKeywords) {
            console.log(fromKeywords, toKeywords);
            window.app.trip.trigger('keywords-changed');
            window.app.trip.keywords = window.app.trip.get('keywords');
          }
        }, 300));

        window.app.participants = window.app.user.getRealtimeParticipants(tripId, userId);
        me.children.sidebar.displayTrip();
        me.children.map.displayTrip();
      }, 100);
  };

  Page.prototype.onShowTrip = function (event) {
    this.children.map.trip = event.trip;
  };

  Page.prototype.onOriginAirportSelected = function (event) {
    this.children.map.trip = event.trip;
  };

  Page.prototype.onDestinationAirportSelected = function (event) {
    this.children.map.trip = event.trip;
  };

  Page.prototype.onShowTripList = function (event) {
    this.children.map.trip = undefined;
  };

  Page.prototype.loginLoop = function (response) {
    var me = this;
    if (response.status !== 'connected') {
      return new B(function (resolve) {
          FB.login(resolve, {
            scope: 'public_profile,email,user_friends'
          });
        })
        .then(function (response) {
          return me.loginLoop(response);
        });
    }

    //TODO: handle missing permissions
    return B.resolve(response);
  };

  Page.prototype.getLoginStatus = function () {
    var me = this;
    return new B(function (resolve) {
        FB.getLoginStatus(resolve);
      })
      .then(function (response) {
        return me.loginLoop(response);
      })
      .then(function (response) {
        window.app.user = new User({
          id: response.authResponse.userID
        });
        return new B(function (resolve) {
          window.app.user.once('sync', function () {
            window.app.user.set({
              accessToken: response.authResponse.accessToken,
              expiresIn: response.authResponse.expiresIn,
              signedRequest: response.authResponse.signedRequest
            });

            FB.api('/me', function (u) {
              window.app.user.set({
                name: u.name
              });
            });
            resolve();
          });
        })

      });
  };

  Page.prototype.detectLocation = function () {
    var me = this;
    return new B(function (resolve, reject) {
        geolocator.locate(resolve, reject);
      })
      .then(function (location) {
        if (location) {
          if (!location.coords) {
            return new B(function (resolve) {
                var coder = new GeocoderJS.createGeocoder({
                  provider: 'google',
                  useSSL: true
                });
                coder.geocode(location.formattedAddress, resolve);
              })
              .then(function (result) {
                location.coords = _.pick(result[0] || result, 'latitude', 'longitude');
                return location;
              });
          }
          location.coords = _.pick(location.coords, 'latitude', 'longitude');
        }
        return location;
      })
      .then(function (location) {
        if (location) {
          window.app.user.set({
            coords: _.result(location, 'coords')
          });
        }
      });
  };

  return Page;


});
