'use strict';
var config = require('./../config'),
  B = require('bluebird'),
  mongoose = B.promisifyAll(require('mongoose')),
  L = require('./../logger');

if (config.mongo.options.debug) {
  mongoose.set('debug', function(collectionName, method, query, doc, options) {
    L.debugAsync('\x1B[0;36mMongoose:\x1B[0m db.%s.%s(%s) %s %s'
      , collectionName
      , method
      , print(query)
      , print(doc)
      , print(options));
  });
}

mongoose.initialize = function() {

  var that = this;
  if (!that.initialized) {
    that.initialized = true;
    return new B(function(resolve, reject) {
      mongoose.set('debug', (config.mongo.options || {}).debug);
      mongoose.connect(config.mongo.url, config.mongo.options || {});

      mongoose.connection.on('error', function(e) {
        L.errorAsync('MongoDb connection failed!', e);
        reject(e);
      });

      mongoose.connection.once('open', function() {
        L.infoAsync('MongoDB connection established.');
        resolve();
      });
    });
  }
  return B.resolve();
};

mongoose.close = function() {
  var that = this;

  return new B(function(resolve, reject) {
    that.disconnect(function() {
      that.initialized = false;
      L.infoAsync('MongoDB connection closed.');
      resolve();
    });
  });
};

module.exports = mongoose;
