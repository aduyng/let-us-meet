'use strict';
define(function(require) {
  var Super = require('views/base'),
    FB = require('fb'),
    B = require('bluebird'),
    GoogleMap = require('async!https://maps.google.com/maps/api/js?sensor=false'),
    geocoder = require('geocoder'),
    Users = require('collections/user'),
    TEMPLATE = require('hbs!./map.tpl');

  var View = Super.extend({});


  View.prototype.render = function() {
    var me = this;
    Super.prototype.render.apply(this, arguments)
      .then(function() {
        return me.renderMap();
      })
  };

  View.prototype.draw = function() {
    this.$el.html(TEMPLATE({
      id: this.getId()
    }));
    if (this.options.trip) {
      this.displayTrip();
    }
  };

  View.prototype.initEvents = function() {
    var events = {};
    //events['keyup ' + this.toId('query')] = 'onQueryKeyUp';
    this.delegateEvents(events);
  };

  View.prototype.renderMap = function() {

    var coords = window.app.session.getUser().get('coords') || {};

    this.children.map = new google.maps.Map(this.controls.map.get(0), {
      center: {lat: coords.latitude, lng: coords.longitude},
      zoom: 8,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry",
          "stylers": [
            {
              "visibility": "simplified"
            }
          ]
        },
        {
          "featureType": "all",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.government",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.medical",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.place_of_worship",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.school",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "simplified"
            }
          ]
        },
        {
          "featureType": "transit.station.airport",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "on"
            },
            {
              hue: "#ff5252"
            }
          ]
        },
        {
          "featureType": "transit.station.bus",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit.station.rail",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ]
    });

    // Create a marker and set its position.
    this.children.myMarker = new google.maps.Marker({
      map: this.children.map,
      position: {lat: coords.latitude, lng: coords.longitude},
      title: window.app.session.getUser().get('name'),
      animation: google.maps.Animation.DROP
    });
  };

  Object.defineProperty(View.prototype, 'trip', {
    set: function(trip) {
      this.options.trip = trip;
      this.displayTrip();
    }
  });

  View.prototype.displayTrip = function() {
    var me = this;
    this.children.myMarker.setMap(null);

    this.attendees = new Users(this.options.trip.get('attendees'));
    this.attendees.each(function(attendee, index) {
      var coords = attendee.get('coords') || {};
      var marker = new google.maps.Marker({
        map: me.children.map,
        position: {lat: coords.latitude, lng: coords.longitude},
        title: attendee.get('name'),
        animation: google.maps.Animation.DROP,
        icon: window.app.config.baseUrl + '/images/markers/' + index + '.png'
      });
      attendee.set('marker', marker);
    });
  };

  return View;
});
