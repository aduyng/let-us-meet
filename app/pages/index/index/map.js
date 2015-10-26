'use strict';
define(function (require) {
  var Super = require('views/base'),
    FB = require('fb'),
    B = require('bluebird'),
    GoogleMap = require('async!https://maps.google.com/maps/api/js?sensor=false'),
    geocoder = require('geocoder'),
    Users = require('collections/user'),
    User = require('models/user'),
    INFO_WINDOW = require('hbs!./map.info-window.tpl'),
    Sabre = require('models/sabre'),
    Airports = require('collections/airport'),
    Airport = require('models/airport'),
    TEMPLATE = require('hbs!./map.tpl');

  var View = Super.extend({});


  View.prototype.initialize = function () {
    Super.prototype.initialize.apply(this, arguments);
    this.airports = Airports.getInstance();
  };

  View.prototype.render = function () {
    var me = this;
    Super.prototype.render.apply(this, arguments)
      .then(function () {
        return me.renderMap();
      });
  };

  View.prototype.draw = function () {
    this.$el.html(TEMPLATE({
      id: this.getId()
    }));
  };

  View.prototype.initEvents = function () {
    var events = {};
    this.delegateEvents(events);
  };

  View.prototype.renderMap = function () {
    var me = this;
    var coords = window.app.user.get('coords') || {};

    this.children.map = new google.maps.Map(this.controls.map.get(0), {
      center: {
        lat: coords.latitude,
        lng: coords.longitude
      },
      zoom: 6,
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

    this.airports.each(function (airport) {
      // Create a marker and set its position.
      airport.marker = new google.maps.Marker({
        map: me.children.map,
        position: {
          lat: airport.get('latitude'),
          lng: airport.get('longitude')
        },
        title: airport.get('name'),
        icon: window.config.baseUrl + '/images/markers/measle_blue.png'
      });

      google.maps.event.addListener(airport.marker, 'click', function (event) {
        me.onAirportClick(event, airport);
      });
    });

    if (window.app.trip && window.app.trip.get('destination')) {
      return this.drawAllPaths(new Airport(window.app.trip.get('destination')));
    }

  };
  View.prototype.onAirportClick = function (event, sender) {
    if (window.app.trip) {
      this.trigger('airport-click', {
        event: event,
        airport: sender
      });

    }
  };


  View.prototype.drawAllPaths = function (toAirport) {
    var me = this;
    var to = toAirport;
    var toCoords = {
      lat: to.get('latitude'),
      lng: to.get('longitude')
    };

    if (this.children.destinationMarker) {
      this.children.destinationMarker.setMap(null);
      delete this.children.destinationMarker;
    }

    this.children.destinationMarker = new google.maps.Marker({
      map: me.children.map,
      position: toCoords,
      title: to.get('name')
    });


    if (window.app.participants) {
      window.app.participants.each(function (participant) {
        participant.set('to', to.toJSON());


        if (participant.flightPath) {
          participant.flightPath.setMap(null);
          delete participant.flightPath;
        }

        var from = participant.get('from') || {};
        var coords = (participant.get('from') ? participant.get('from') : participant.get('coords')) || {};
        var fromCoords = {
          lat: coords.latitude,
          lng: coords.longitude
        };

        if (!participant.fromMarker) {
          participant.fromMarker = new google.maps.Marker({
            map: me.children.map,
            position: fromCoords,
            title: from.name || participant.get('name'),
            icon: User.getAvatarUrl(participant.get('id'))
          });
        }

        participant.flightPath = new google.maps.Polyline({
          map: me.children.map,
          path: [fromCoords, toCoords],
          geodesic: true,
          strokeColor: '#FF5252',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
      });
    }



    //return B.resolve(Sabre.getInstance().findLowestFare(itinerary.get('from'), itinerary.get('to')))
    //  .then(function(fare) {
    //    var infoWindow = new google.maps.InfoWindow({
    //      content: INFO_WINDOW({
    //        attendee: itinerary.toJSON(),
    //        price: numeral(fare.price).format('$0,0')
    //      }),
    //      position: event.latLng,
    //      map: me.children.map
    //    });
    //    infoWindow.open(me.children.map, toAirport);
    //  });
  };

  View.prototype.clearTrip = function () {
    //this.children.myMarker.setMap(this.children.map);
    if (this.trip && this.trip.destinationMarker) {
      this.trip.destinationMarker.setMap(null);
      delete this.trip.destinationMarker;
    }
    if (this.attendees) {
      this.attendees.forEach(function (attendee) {
        //attendee.marker && attendee.marker.setMap(null);
        attendee.fromMarker && attendee.fromMarker.setMap(null);
        attendee.flightPath && attendee.flightPath.setMap(null);
      });
    }
  };

  View.prototype.displayTrip = function () {
    console.log('map::displayTrip()');
    var me = this;
    if (window.app.trip.get('destination')) {
      this.drawAllPaths(new Airport(window.app.trip.get('destination')));
    }

    window.app.trip.on('destination-changed', function () {
      me.drawAllPaths(new Airport(window.app.trip.get('destination')));
    });
  };

  //View.prototype.onFlightPathClick = function(event, sender, itinerary) {
  //  var me = this;
  //  return B.resolve(Sabre.getInstance().findLowestFare(itinerary.get('from'), itinerary.get('to')))
  //    .then(function(fare) {
  //      var infoWindow = new google.maps.InfoWindow({
  //        content: INFO_WINDOW({
  //          attendee: itinerary.toJSON(),
  //          price: numeral(fare.price).format('$0,0')
  //        }),
  //        position: event.latLng,
  //        map: me.children.map
  //      });
  //      infoWindow.open(me.children.map, sender);
  //    });
  //};
  return View;
});
