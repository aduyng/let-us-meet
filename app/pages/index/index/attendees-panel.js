'use strict';
define(function (require) {
  var Super = require('views/base'),
    B = require('bluebird'),
    numeral = require('numeral'),
    Sabre = require('models/sabre'),
    TEMPLATE = require('hbs!./attendees-panel.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function () {
    Super.prototype.initialize.apply(this, arguments);

    this.boundRender = this.render.bind(this);

    this.model = window.app.trip;
    this.model.on('destination-changed', this.boundRender);

    this.collection = window.app.participants;
    this.collection.on('add remove', this.boundRender);
  };

  View.prototype.remove = function () {
    this.collection.off('all', this.boundRender);
    Super.prototype.remove.apply(this, arguments);
  };

  View.prototype.render = function () {
    var me = this;
    return Super.prototype.render.apply(this, arguments)
      .then(function () {
        return me.calculateLowestFares();
      });
  };

  View.prototype.calculateLowestFares = function () {
    var me = this;
    var sabre = Sabre.getInstance();

    return B.all(me.collection.map(function (participant) {
      var from = participant.get('from') || participant.get('coords');
      var to = participant.get('to') || me.model.get('destination');
      if (from && to) {
        return B.resolve(sabre.findLowestFare(from, to))
          .then(function (fare) {
            me.find(me.toId('cheapest-price-' + participant.id)).text(numeral(fare.price).format('$0,0')).removeClass('hidden');
          });
      }
    }));
  };

  View.prototype.draw = function () {
    var me = this;



    me.$el.html(TEMPLATE({
      id: me.getId(),
      trip: me.model.toJSON(),
      attendees: this.collection.toJSON(),
      isCreator: me.model.get('userId') === window.app.user.id,
      isJoined: this.collection.get(window.app.user.id)
    }));
  };

  View.prototype.initEvents = function () {
    var events = {};
    events['click ' + this.toId('invite')] = 'onInviteClick';
    events['click ' + this.toId('join')] = 'onJoinClick';
    this.delegateEvents(events);
  };

  View.prototype.onInviteClick = function (e) {
    FB.ui({
      method: 'send',
      link: [window.config.backendUrl, 'trip', this.model.id, 'invite'].join('/')
    });
  };

  View.prototype.onJoinClick = function () {
    this.collection.create({
      id: window.app.user.id,
      name: window.app.user.get('name'),
      coords: window.app.user.get('coords')
    });
  };

  return View;
});
