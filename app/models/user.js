'use strict';
define(function (require) {
    var _ = require('underscore'),
        Super = require('./base');

    var Model = Super.extend({
        name: 'user'
    });

    Model.prototype.getAvatarUrl = function(){
        return 'http://graph.facebook.com/' + this.get('userId') + '/picture?type=square';
    }

    return Model;
});
