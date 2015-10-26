'use strict';
var B = require('bluebird'),
  config = require('../config'),
  _ = require('underscore'),
  moment = require('moment'),
  L = require('../logger'),
  U = require('../utils'),
  request = require('request'),
  S = require('underscore.string');


exports.autocomplete = function(req, res, next) {
  request.get({
    url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    qs: {
      key: config.google.browserApiKey,
      input: req.query.term,
      types: 'geocode'
    },
    json: true
  })
    .pipe(res);
};

exports.read = function(req, res, next) {
  request.get({
    url: 'https://maps.googleapis.com/maps/api/place/details/json',
    qs: {
      key: config.google.browserApiKey,
      placeid: req.params.id
    },
    json: true
  })
    .pipe(res);
};