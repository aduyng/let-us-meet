'use strict';
var config = require('./config'),
  B = require('bluebird'),
  winston = require('winston'),
  _ = require('underscore');

var level = process.env.LOG_LEVEL;
if (!level) {
  if (process.env.NODE_ENV === 'test') {
    level = 'warn';
  }else if (process.env.NODE_ENV === 'development') {
    level = 'debug';
  }else{
    level = 'info';
  }
}
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      level: level
    })
  ]
});
var L = B.promisifyAll(logger);

L.fn = function(file, fn, args) {
  return file + ' ::' + fn + '(' + _.map(args, function(arg) {
      if (_.isObject(arg)) {
        if (arg.toBriefJSON) {
          return JSON.stringify(arg.toBriefJSON());
        }

        if (arg.toJSON) {
          return JSON.stringify(arg.toJSON());
        }


        if (arg.toHexString) {
          return arg.toHexString();
        }
        return JSON.stringify(arg);
      }

      return arg;
    }).join(',') + ')';
};
module.exports = L;