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
    email: {
        type: String,
        trim: true,
        required: true
    },
    uid: {
        type: String,
        trim: true,
        required: true
    },
    auth: {
        type: odm.Schema.Types.Mixed,
        select: false
    },
    avatarUrl: {
        type: String,
        trim: true
    },
    profileUrl: {
        type: String,
        trim: true
    },
    path: {
        type: String,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    domainId: {
        type: odm.Schema.Types.ObjectId,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    lastLoggedInAt: {
        type: Number
    },
    customerId: {
        type: String
    },
    organizations: {
        type: [odm.Schema.Types.Mixed]
    },
    groupIds: {
        type: [odm.Schema.Types.ObjectId]
    },
    isDeleted: {
        type: Boolean,
        default: true
    },
    isActiveInDomain: {
        type: Boolean,
        default: false
    }
});


module.exports = Schema;