define(function (require) {
    var FB = require('facebook');

    FB.init({
        appId: window.config.facebook.appId,
        version: window.config.facebook.apiVersion
    });

    FB.getLoginStatus(function (response) {
        console.log(response);
    });

    return FB;
});