'use strict';
define(function(require) {
  var Super = require('views/base'),
    TEMPLATE = require('hbs!./attendees.tpl');

  var View = Super.extend({});


  View.prototype.draw = function() {
    var me = this;
    //fetching all attendees
    this.$el.html(TEMPLATE({
      id: me.getId(),
      trip: me.model.toJSON(),
      attendees: _.map(me.model.get('attendees'), function(attendee, index) {
        return _.extend(attendee, {
          markerUrl: window.config.baseUrl + '/images/markers/' + index + '.png'
        });
      })
    }));
  };

  View.prototype.initEvents = function() {
    var events = {};
    events['click ' + this.toId('invite')] = 'onInviteClick';
    this.delegateEvents(events);
  };

  View.prototype.onInviteClick = function(e) {
    console.log([window.config.backendUrl, 'trip', this.model.id, 'invite'].join('/'));
    FB.ui({
      method: 'send',
      link: [window.config.backendUrl, 'trip', this.model.id, 'invite'].join('/')
    });
  };

  return View;
});
