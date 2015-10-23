'use strict';
define(function(require) {
  var Backbone = require('backbone'),
    _ = require('underscore'),
    L = require('logger'),
    Super = Backbone.Model,
    ObjectId = require('ObjectId');

  var Model = Super.extend({
    url: function() {
      return '/' + this.name + (this.attributes && (this.attributes.id || this.attributes._id) ? '/' + (this.attributes.id || this.attributes._id) : '');
    },
    parse: function(response, options) {
      if (_.isArray(response)) {
        return Super.prototype.parse.apply(this, [response[0], options]);
      }
      return Super.prototype.parse.apply(this, arguments);
    },
    idAttribute: 'id'
  });

  Model.prototype.initialize = function() {
    if (!this.attributes[this.idAttribute]) {
      this.attributes[this.idAttribute] = new ObjectId().toString();
    }
    if (!this.id) {
      this.id = this.attributes[this.idAttribute];
    }
  };

  Model.prototype.getAndCache = function(key, ClassName) {
    if (!this[key]) {
      this[key] = new ClassName(this.get(key));
    }
    return this[key];
  };

  Model.prototype.clearCachedObjects = function(key) {
    if (!_.isArray(key)) {
      key = [key];
    }
    _.each(key, function(k) {
      if (this[k]) {
        delete this[k];
      }
    }.bind(this));
    return this;
  };

  Model.prototype.pushCachedObjects = function(key) {
    if (!_.isArray(key)) {
      key = [key];
    }
    _.each(key, function(k) {
      if (this[k]) {
        this.set(k, _.result(this[k], 'toJSON', this[k]), {silent: true});
      }
    }.bind(this));
    return this;
  };

  Model.prototype.toJSON = function() {
    var data = Super.prototype.toJSON.apply(this, arguments);
    data.id = data._id;
    return data;
  };

  Model.diff = function(from, to) {
    var deepDiffMapper = function() {
      return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
          if (this.isFunction(obj1) || this.isFunction(obj2)) {
            throw 'Invalid argument. Function given, object expected.';
          }
          if (this.isValue(obj1) || this.isValue(obj2)) {
            return {type: this.compareValues(obj1, obj2), data: obj1 || obj2};
          }

          var diff = {};
          for (var key1 in obj1) {
            if (this.isFunction(obj1[key1])) {
              continue;
            }

            var value2;
            if (typeof obj2[key1] !== 'undefined') {
              value2 = obj2[key1];
            }

            diff[key1] = this.map(obj1[key1], value2);
          }
          for (var key2 in obj2) {
            if (this.isFunction(obj2[key2]) || (typeof diff[key2] !== 'undefined' )) {
              continue;
            }

            diff[key2] = this.map(undefined, obj2[key2]);
          }

          return diff;

        },
        compareValues: function(value1, value2) {
          if (value1 === value2) {
            return this.VALUE_UNCHANGED;
          }
          if (typeof value1 === 'undefined') {
            return this.VALUE_CREATED;
          }
          if (typeof value2 === 'undefined') {
            return this.VALUE_DELETED;
          }

          return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
          return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
          return {}.toString.apply(obj) === '[object Array]';
        },
        isObject: function(obj) {
          return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
          return !this.isObject(obj) && !this.isArray(obj);
        }
      };
    }();
    var hasChanged = function(obj, key) {
      if (!obj) {
        return false;
      }
      if (obj.type && _.contains(['deleted', 'created', 'updated'], obj.type)) {
        L.info(obj.type, key, obj);
        return obj;
      }
      if (_.isObject(obj)) {
        return _.find(obj, function(value, k) {
          return hasChanged(value, k);
        });
      }
      return false;
    };
    var result = deepDiffMapper.map(from, to);
    return hasChanged(result);
  };

  return Model;
});
