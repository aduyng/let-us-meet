'use strict';

var config = require('./config'),
  B = require('bluebird'),
  _ = require('underscore'),
  moment = require('moment'),
  logger = require('./logger'),
  AppError = require('./error'),
  S = require('underscore.string');


exports.sendError = function(e, req, res, next) {
  var data = {
    code: 400,
    message: 'Unknown Error'
  };


  //if (e instanceof Checkit.Error) {
  //    res.send(400, {
  //        type   : 'ValidationError',
  //        message: e.message,
  //        data   : e.toJSON()
  //    });
  //    return;
  //}

  if (_.isString(e)) {
    data.message = e;
  }
  if (e instanceof AppError) {
    data.code = e.code;
    data.message = e.message;
  }
  if (e instanceof Error) {
    data.message = e.message;
  }

  logger.error(e, (e || {}).stack || '');
  res.send(data.code, data.message);
};

exports.sanitizeReqObject = function (req) {
  if(_.isEmpty(req)) {
    return req;
  }
  var stack = [req.params, req.body, req.query, req.url, req.originalUrl];
  while(stack.length > 0) {
    var data = stack.pop();
    for(var key in data){
      if(data.hasOwnProperty(key)) {
        if(_.isObject(data[key])) {
          stack.push(data[key]);
        } else {
          // sanitize only non empty strings
          if(!_.isBoolean(data[key]) && !_.isNumber(data[key]) && (_.isString(data[key]) && !_.isEmpty(data[key]))) {
            data[key] = req.sanitize(data[key]);
          }
        }
      }
    }
  }
  return req;
};

exports.diff = function(from, to) {
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