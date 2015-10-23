'use strict';
var config = require('./config'),
  B = require('bluebird'),
  _ = require('underscore'),
  moment = require('moment'),
  L = require('./logger'),
  S = require('underscore.string'),
  googleapis = require('googleapis');


function GClient(options) {
  var tokens, opts = {};
  options = options || {};
  if (options.tokens) {
    tokens = options.tokens;
    delete options.tokens;
  }

  _.extend(opts, options);
  this.google = googleapis;


  this.oauth = new this.google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.app.backend + config.google.redirectUrl);
  opts.auth = this.oauth;

  this.google.options(opts);

  if (tokens) {
    this.oauth.setCredentials(tokens);
  }
}

module.exports = GClient;
