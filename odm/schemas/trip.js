'use strict';
var env = process.env.NODE_ENV || 'development',
  config = require('./../../config'),
  B = require('bluebird'),
  odm = require('../odm'),
  L = require('./../../logger'),
  moment = require('moment'),
  _ = require('underscore'),
  extend = require('mongoose-schema-extend'),
  Super = require('./base');


var Schema = Super.extend({
  name: {
    type: String,
    trim: true,
    required: true
  },
  userId: {
    type: String,
    trim: true,
    required: true
  },
  attendeeIds: {
    type: [String]
  }
});


module.exports = Schema;