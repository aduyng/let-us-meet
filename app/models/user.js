'use strict';
define(function(require) {
  var Super = require('./realtime');

  var Model = Super.extend({
    name: 'user'
  });

  Model.getAvatarUrl = function(id) {
    return 'https://graph.facebook.com/' + id + '/picture?type=square';
  };

  Model.prototype.getAvatarUrl = function() {
    return Model.getAvatarUrl(this.id);
  };

  return Model;
});
