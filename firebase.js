'use strict';

var config = require('./config'),
  B = require('bluebird'),
  Firebase = require('firebase');

B.promisifyAll(Firebase);
B.promisifyAll(Firebase.prototype);

Firebase.createUserConnection = function(userId){
  return new Firebase(config.firebase.url + 'users/' + userId);
};
module.exports = Firebase;