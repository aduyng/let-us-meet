'use strict';
var B = require('bluebird'),
    config = require('../config'),
    _ = require('underscore'),
    moment = require('moment'),
    L = require('../logger'),
    U = require('../utils'),
    S = require('underscore.string');


exports.home = function (req, res, next) {
    res.render('home', {
        path: config.app.frontend + (process.env.NODE_ENV !== 'development' ? '/' + config.app.version : ''),
        config: config,
        lang: 'us',
        env: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV === 'development',
        systemMessage: config.app.systemMessage
    });
};