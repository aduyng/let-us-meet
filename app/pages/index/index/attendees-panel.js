'use strict';
define(function(require) {
  var Super = require('views/base'),
    B = require('bluebird'),
    Participants = require('collections/participant'),
    TEMPLATE = require('hbs!./attendees-panel.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function() {
    Super.prototype.initialize.apply(this, arguments);

    this.boundDraw = this.draw.bind(this);

    this.model = window.app.trip;
    this.model.on('all', this.boundDraw);

    this.collection = window.app.participants;
    this.collection.on('all', this.boundDraw);
  };

  View.prototype.remove = function() {
    this.collection.off('all', this.boundDraw);
    Super.prototype.remove.apply(this, arguments);
  };

  View.prototype.draw = function() {
    var me = this;
    me.$el.html(TEMPLATE({
      id: me.getId(),
      trip: me.model.toJSON(),
      attendees: this.collection.toJSON(),
      isCreator: me.model.get('userId') === window.app.user.id,
      isJoined: this.collection.get(window.app.user.id)
    }));
  };

  View.prototype.initEvents = function() {
    var events = {};
    events['click ' + this.toId('invite')] = 'onInviteClick';
    events['click ' + this.toId('join')] = 'onJoinClick';
    this.delegateEvents(events);
  };

  View.prototype.onInviteClick = function(e) {
    FB.ui({
      method: 'send',
      link: [window.config.backendUrl, 'trip', this.model.id, 'invite'].join('/')
    });
  };

  View.prototype.onJoinClick = function() {
    this.collection.create({
      id: window.app.user.id,
      name: window.app.user.get('name'),
      coords: window.app.user.get('coords')
    });
  };

  return View;
});
