'use strict';
define(function (require) {
  var Super = require('views/base'),
    Backbone = require('backbone'),
    FB = require('fb'),
    B = require('bluebird'),
    Users = require('collections/user'),
    User = require('models/user'),
    INFO_WINDOW = require('hbs!./map.info-window.tpl'),
    Sabre = require('models/sabre'),
    _ = require('underscore'),
    numeral = require('numeral'),
    Sabre = require('models/sabre'),
    MapStyles = require('json!data/map-styles.json'),
    TEMPLATE = require('hbs!./map.tpl');

  var View = Super.extend({});


  View.prototype.initialize = function () {
    Super.prototype.initialize.apply(this, arguments);
    // this.airports = Airports.getInstance();
    this.points = new Backbone.Collection();
    this.points.on('add remove reset', this.drawMakers.bind(this));

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
      zoom: 8,
      styles: MapStyles
    });

    google.maps.event.addListener(this.children.map, 'dragend', this.onMapDragEnd.bind(this));

    this.children.places = new google.maps.places.PlacesService(this.children.map);
  };

  View.prototype.onMapDragEnd = function () {
    this.searchPlaces();
  };

  View.prototype.searchPlaces = function () {
    var me = this;
    var conditions = {
      bounds: me.children.map.getBounds()
    };

    if (window.app.trip && window.app.trip.get('keywords')) {
      conditions.types = [window.app.trip.get('keywords')];
    }
    
    new B(function (resolve, reject) {
        me.children.places.radarSearch(conditions, function (result, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            return resolve(result);
          }
          return reject(status);
        });
      })
      .then(function (result) {
        if( result ){
          result = _.map(result, function(record){
            record.type = conditions.types[0];
            return record;
          });
          me.points.add(result);
        }
      })
      .catch(function(ignore){
      });
  };

  View.prototype.clearMarkers = function () {
    this.points.each(function (point) {
      point.marker && point.marker.setMap(null);
    });
  };

  View.prototype.drawMakers = function () {
    var me = this;
    me.points.each(function (point) {
      if (!point.marker) {

        point.marker = new google.maps.Marker({
          map: me.children.map,
          position: point.get('geometry').location,
          title: point.get('name'),
          icon: window.config.baseUrl + '/images/markers/' + point.get('type') + '.png'
        });

        google.maps.event.addListener(point.marker, 'click', function (event) {
          me.onDestinationClick(event, point);
        });

        // google.maps.event.addListener(point.marker, 'mouseover', function (event) {
        //   point.marker.setIcon(window.config.baseUrl + '/images/markers/dot-14.png');
        // });

        // google.maps.event.addListener(point.marker, 'mouseout', function (event) {
        //   point.marker.setIcon(window.config.baseUrl + '/images/markers/dot-9.png');
        // });
      }

    });

  }

  View.prototype.onDestinationClick = function (event, sender) {
    if (window.app.trip) {
      this.trigger('destination-click', {
        event: event,
        destination: {
          latitude: sender.get('geometry').location.lat(),
          longitude: sender.get('geometry').location.lng(),
          id: sender.get('place_id'),
          type: sender.get('type')
        }
      });
    }
  };


  View.prototype.drawAllPaths = function (to) {
    console.log('draw');
    var me = this;
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
      icon: window.config.baseUrl + '/images/markers/' + to.get('type') + '.png'
    });

    me.renderPlaceInfo(to);

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
  };


  View.prototype.calculateLowestFares = function (to) {
    var me = this;
    var sabre = Sabre.getInstance();
    // var to = {
    //   latitude: point.get('geometry').location.lat(),
    //   longitude: point.get('geometry').location.lng()
    // };
    var total = 0;
    return B.all(window.app.participants.map(function (participant) {
        var from = participant.get('from') || participant.get('coords');
        if (from && to) {
          return B.resolve(sabre.findLowestFare(from, to))
            .then(function (fare) {
              total += (fare || {}).price;
            });
        }
      }))
      .then(function () {
        return total;
      });
  };

  View.prototype.renderPlaceInfo = function (to) {
    var me = this;
    return new B(function (resolve, reject) {
        me.children.places.getDetails({
          placeId: to.id
        }, function (result, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            return resolve(result);
          }
          return reject(status);
        });
      })
      .then(function (place) {
        return me.calculateLowestFares({
            latitude: to.get('latitude'),
            longitude: to.get('longitude')
          })
          .then(function (total) {
            me.children.infoWindow = new google.maps.InfoWindow({
              content: INFO_WINDOW({
                name: place.name,
                address: place.adr_address || place.formatted_address,
                photos: _.map(_.first(place.photos, 5), function (photo) {
                  return photo.getUrl({
                    maxWidth: 100,
                    maxHeight: 100
                  });
                }),
                phone: place.formatted_phone_number,
                url: place.url,
                rating: place.rating,
                total: numeral(total).format('$0,0')
              }),
              position: place.geometry.location,
              map: me.children.map
            });
            me.children.infoWindow.open(me.children.map, me.children.destinationMarker);
          });
      });
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
    var me = this;

    if (window.app.trip.get('destination')) {
      this.drawAllPaths(new Backbone.Model(window.app.trip.get('destination')));
    }

    window.app.trip.on('destination-changed', function () {
      me.drawAllPaths(new Backbone.Model(window.app.trip.get('destination')));
    });

    window.app.trip.on('keywords-changed', function () {
      me.clearMarkers();
      me.searchPlaces();
    });

    if (window.app.trip.get('keywords')) {
      me.clearMarkers();
      me.searchPlaces();
    }
  };
  return View;
});
