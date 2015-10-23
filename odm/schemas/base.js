'use strict';
var env = process.env.NODE_ENV || 'development',
  config = require('./../../config'),
  B = require('bluebird'),
  odm = require('../odm'),
  L = require('./../../logger'),
  _ = require('underscore');


var Schema = new odm.Schema({
  createdAt: {
    type: Number
  },
  updatedAt: {
    type: Number
  }
}, {
  discriminatorKey: '_type'
});

Schema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = _.now();
  }
  this.updatedAt = _.now();
  next();
});

Schema.virtual('id').get(function() {
  return _.result(this._id, 'toHexString', this._id);
});

// Ensure virtual fields are serialised.
Schema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret, options) {
    delete ret._type;
    delete ret.__v;
  }
});

Schema.statics.toHexString = function(id) {
  return _.result(id, 'toHexString', id);
};


Schema.methods.export = function(viewer){
  return this.toJSON();
};

module.exports = Schema;