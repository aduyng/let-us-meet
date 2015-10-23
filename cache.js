'use strict';
var config = require('./config'),
  B = require('bluebird'),
  url = require('url'),
  redis = require('redis');

var parsedUrl = url.parse(config.redis.url);

var client = redis.createClient(parsedUrl.port, parsedUrl.hostname);
client.auth(parsedUrl.auth.split(':').pop());

module.exports = B.promisifyAll(client);
