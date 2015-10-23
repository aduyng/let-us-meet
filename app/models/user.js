'use strict';
define(function (require) {
    var _ = require('underscore'),
        Super = require('./base');

    var Model = Super.extend({
        name: 'user'
    });


    return Model;
});
