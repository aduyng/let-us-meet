define(function (require) {
    var FB = require('facebook');
    var B = require('bluebird');
    
    FB.init({
        appId: window.config.facebook.appId,
        version: window.config.facebook.apiVersion
    });
    
    return FB;
});