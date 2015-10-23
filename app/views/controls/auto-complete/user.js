'use strict';
define(function(require) {
  var Super = require('views/controls/auto-complete'),
    UserCollection = require('collections/user'),
    UserModel = require('models/user'),
    Select2 = require('select2'),
    RESULT = require('hbs!templates/partials/badgeUser'),
    _ = require('underscore'),
    B = require('bluebird'),
    View = Super.extend({
      id: 'auto-complete-user'
    });

  View.prototype.initialize = function(options) {
    Super.prototype.initialize.call(this, options);
    if (!this.collection) {
      this.collection = new UserCollection();
    }
  };


  View.prototype.draw = function() {
    var that = this;
    that.$el.select2(_.extend({
      minimumInputLength: 1,
      openOnEnter: false,
      placeholder: window.app.translator.get('Select a user'),
      allowClear: true,
      query: _.debounce(function(query) {
        B.resolve(that.collection.fetch({
          data: {
            query: query.term,
            limit: 10
          }
        }))
          .then(function() {
            query.callback({
              results: that.collection.toJSON()
            });
          });
      }, 300),
      formatResult: function(object, container, query) {
        return RESULT({
          user: object,
          emailAsText: true,
          clazz: 'badge-user-inline',
          showRole: that.options.showRoleInResults
        });
      },
      formatSelection: function(object, container, query) {
        return RESULT({
          user: object,
          emailAsText: true,
          clazz: 'badge-user-inline',
          showRole: that.options.showRoleInResults
        });

      }
    }, that.options.select2));
  };

  View.prototype.val = function(value) {

    if (value === undefined) {
      return this.collection.get(this.$el.val());
    }

    if (value instanceof UserModel) {
      this.collection.add(value);
      this.$el.select2('data', value.toJSON());
    }

    return this;
  };

  return View;
});
