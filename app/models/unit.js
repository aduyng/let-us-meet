'use strict';
define(function(require) {
  var Super = require('./base');


  var Model = Super.extend({
    name: 'unit'
  });

  Model.prototype.toBriefJSON = function() {
    return this.pick('_id', 'id', 'path', 'name');
  };

  return Model;
});
