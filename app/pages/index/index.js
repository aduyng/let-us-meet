'use strict';
define(function(require) {
  var Super = require('views/page'),
    TEMPLATE = require('hbs!./index.tpl'),
    B = require('bluebird'),
    FB = require('fb'),
    Map = require('./index/map'),
    geocoder = require('geocoder'),
    Sidebar = require('./index.sidebar');

  var Page = Super.extend({});


  Page.prototype.render = function() {
    var me = this;
    return new B(function(resolve) {
      FB.getLoginStatus(resolve);
    })
      .then(function(response) {
        me.session.set('isLoggedIn', response.status === 'connected');
        return me.getLoginStatus();
      })
      .then(function() {
        if (!me.session.getUser().get('coords')) {
          return me.detectLocation();
        }
        return B.resolve();
      })
      .then(function() {
        var params = {
          id: me.id
        };

        me.$el.html(TEMPLATE(params));
        me.mapControls();

        return B.all([me.renderSidebar(), me.renderMap()])
          .then(function() {
            var events = {};
            me.delegateEvents(events);

            return me.ready();
          });
      });
  };
  Page.prototype.renderMap = function() {
    this.children.map = new Map({
      el: this.controls.map
    });
    return this.children.map.render();
  };

  Page.prototype.renderSidebar = function() {
    this.children.sidebar = new Sidebar({
      el: this.controls.sidebar
    });
    this.children.sidebar.on('trip-click', this.onTripClick.bind(this));
    return this.children.sidebar.render();
  };

  Page.prototype.onTripClick = function(event) {
    this.children.map.trip = event.trip;
  };

  Page.prototype.loginLoop = function(response) {
    var me = this;
    if (response.status !== 'connected') {
      return new B(function(resolve) {
        FB.login(resolve, {
          scope: 'public_profile,email,user_friends'
        });
      })
        .then(function(response) {
          return me.loginLoop(response);
        });
    }

    //TODO: handle missing permissions
    return B.resolve(response);
  };

  Page.prototype.getLoginStatus = function() {
    var me = this;
    var user = this.session.getUser() || new User();
    return new B(function(resolve) {
      FB.getLoginStatus(resolve);
    })
      .then(function(response) {
        return me.loginLoop(response);
      })
      .then(function(response) {

        user.set({
          accessToken: response.authResponse.accessToken,
          expiresIn: response.authResponse.expiresIn,
          signedRequest: response.authResponse.signedRequest,
          userId: response.authResponse.userID
        });

        return new B(function(resolve) {
          FB.api('/me', resolve);
        });
      })
      .then(function(u) {
        user.set({
          name: u.name
        });
        return B.resolve(user.save());
      })
      .then(function() {
        me.session.set('isLoggedIn', true);
        me.session.set('user', user.toJSON())
          .clearCachedObjects('user');
      });
  };

  Page.prototype.detectLocation = function() {
    var me = this;
    return new B(function(resolve, reject) {
      geolocator.locate(resolve, reject, true);
    })
      .then(function(location) {
        if (location) {
          if (!location.coords) {
            return new B(function(resolve) {
              var geocoder = new GeocoderJS.createGeocoder({
                provider: 'google',
                useSSL: true
              });
              geocoder.geocode(location.formattedAddress, resolve);
            })
              .then(function(result) {
                location.coords = _.pick(result[0] || result, 'latitude', 'longitude');
                return location;
              });
          }
          location.coords = _.pick(location.coords, 'latitude', 'longitude');
        }
        return location;
      })
      .then(function(location) {
        if (location) {
          var user = window.app.session.getUser();
          return B.resolve(user.save({
            coords: _.result(location, 'coords')
          }));
        }
      });
  };

  return Page;


});
