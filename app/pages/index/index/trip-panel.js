'use strict';
define(function (require) {
  var Super = require('views/base'),
    Dialog = require('views/controls/dialog'),
    B = require('bluebird'),
    moment = require('moment'),
    Select2 = require('select2'),
    TEMPLATE = require('hbs!./trip-panel.tpl');

  var View = Super.extend({});

  View.prototype.initialize = function () {
    Super.prototype.initialize.apply(this, arguments);
    this.boundDraw = this.draw.bind(this);
    this.model = window.app.trip;
    this.model.on('all', this.boundDraw);
  };

  View.prototype.remove = function () {
    this.model.off('all', this.boundDraw);
    Super.prototype.remove.apply(this, arguments);
  };


  View.prototype.draw = function () {
    this.$el.html(TEMPLATE({
      id: this.getId(),
      trip: this.model.toJSON(),
      isCreator: this.model.get('userId') === window.app.user.id
    }));

    this.find(this.toId('keywords')).select2({
      allowClear: false,
      openOnEnter: false,
      data: _.map([
        'airport',
        'amusement_park',
        'aquarium',
        'art_gallery',
        'bar',
        'cafe',
        'campground',
        'casino',
        'city_hall',
        'department_store',
        'museum',
        'night_club',
        'park',
        'rv_park',
        'stadium',
        'university',
        'zoo'
      ], function (tag) {
        return {
          id: tag,
          text: tag
        };
      })
    });
  };

  View.prototype.initEvents = function () {
    var events = {};
    events['click ' + this.toId('remove')] = 'onRemoveClick';
    events['change ' + this.toClass('field')] = 'onFieldChange';
    this.delegateEvents(events);
  };

  View.prototype.onFieldChange = function (event) {
    var e = $(event.currentTarget);
    var value;
    switch (e.data('field')) {
    case 'dateOfArrival':
      value = moment(e.val()).valueOf();
      break;
    case 'keywords':
      value = e.val().trim();
      break;
    default:
      value = e.val().trim();
      break;
    }
    this.model.set(e.data('field'), value);
  };


  View.prototype.onRemoveClick = function (event) {
    var me = this;
    var btn = $(event.currentTarget);
    var dialog = new Dialog({
      body: window.app.translator.get('Are you sure you want to delete this trip?'),
      title: window.app.translator.get('Confirmation'),
      buttons: [{
        id: 'yes',
        label: window.app.translator.get('Yes, I\'m sure.'),
        iconClass: 'fa fa-trash-o',
        buttonClass: 'btn-danger',
        align: 'left'
      }, {
        id: 'no',
        label: window.app.translator.get('No'),
        iconClass: 'fa fa-times',
        buttonClass: 'btn btn-default',
        align: 'right',
        autoClose: true
      }]
    });

    dialog.on('yes', function (e) {
      btn.btnWait(true);
      $(e.currentTarget).btnWait(true);
      B.resolve(window.app.trips.remove(me.model))
        .then(function () {
          me.trigger('trip-deleted', {
            trip: me.model
          });
          me.toast.success(window.app.translator.get('Trip has been deleted.'));
          dialog.close();
        })
        .finally(function () {
          btn.btnWait(false);
          $(e.currentTarget).btnWait(false);
        });
    });

  };


  return View;
});
