define(function(require) {
  var Backbone = require('backbone');
  var B = require('bluebird');
  var _ = require('underscore');
  var moment = require('moment');
  var Model = Backbone.Model.extend({});

  Model.getInstance = function() {
    if (!Model.instance) {
      Model.instance = new Model(window.config.sabre);
    }
    return Model.instance;
  };
  Model.prototype.wrapUrl = function(relative) {
    return [this.get('baseUrl'), relative].join('/');
  };

  Model.prototype.requestAirportsOfMAC = function(mac) {
    return this.request('v1/lists/supported/cities/' + mac + '/airports', {}, {
      type: 'GET'
    })
      .then(function(response) {
        return response.Airports;
      });
  };

  Model.prototype.findLowestFare = function(origin, destination, departureDate, returnDate) {

    function getDistanceFromLatLonInMile(lat1, lon1, lat2, lon2) {
      var R = 3959; // Radius of the earth in km
      var dLat = deg2rad(lat2 - lat1);  // deg2rad below
      var dLon = deg2rad(lon2 - lon1);
      var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    return B.resolve({price: getDistanceFromLatLonInMile(origin.latitude, origin.longitude, destination.latitude, destination.longitude)});

    //TODO: request cheapest fares from API
    //return this.request('v1/shop/flights', {
    //  origin: origin,
    //  destination: destination,
    //  departuredate: moment(departureDate).format('YYYY-MM-DD', departureDate),
    //  returndate: moment(returnDate).format('YYYY-MM-DD', returnDate)
    //}, {
    //  type: 'GET'
    //});
  };

  Model.prototype.geoSearchAirportByCoordinates = function(latitude, longitude, distance) {
    return this.request('v1/lists/utilities/geosearch/locations', {
      GeoSearchRQ: {
        ForPlaces: {
          OfCategory: [
            {
              name: 'AIR'
            }
          ]
        },
        Around: {
          PlaceByLatLong: {
            latitude: latitude,
            longitude: longitude
          },
          distance: distance || 100
        }
      }
    })
      .then(function(result) {
        return _.map((((result.GeoSearchRS || {}).Found || {}).Place || []), function(place) {
          return {
            city: place.City,
            id: place.Id,
            name: place.Name,
            latitude: place.latitude,
            longitude: place.longitude,
            distance: place.distance,
            country: place.country
          }
        });
      });
  };

  Model.prototype.request = function(url, data, options) {
    var me = this;

    function proceed() {
      return new B(function(resolve, reject) {
        var params = _.extend({
          type: 'POST',
          url: me.wrapUrl(url),
          data: data,
          headers: me.getRequestHeaders(),
          success: resolve,
          error: reject
        }, options);
        if (params.type === 'POST') {
          _.extend(params, {
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(data)
          });
        }

        return $.ajax(params);
      });
    }

    if (_.isEmpty(this.get('access_token'))) {
      return this.requestAccessToken()
        .then(proceed);
    }
    return proceed();

  };

  Model.prototype.requestAccessToken = function() {
    var me = this;
    return new B(function(resolve, reject) {
      var params = {
        type: 'POST',
        url: me.wrapUrl('v2/auth/token'),
        data: {
          grant_type: 'client_credentials'
        },

        headers: {
          Authorization: 'Basic ' + me.get('authToken')
        },
        success: function(response) {
          console.log(response);
          me.set(response);
          resolve(response);
        },
        error: reject
      };

      return $.ajax(params);
    });
  };

  Model.prototype.getRequestHeaders = function() {
    return {
      Authorization: 'Bearer ' + this.get('access_token')
    };
  };


  return Model;
});

