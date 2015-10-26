'use strict';
/*global requirejs*/
requirejs.config({
  baseUrl: (typeof window !== 'undefined' && window.config !== undefined && window.config.baseUrl !== undefined) ? (window.config.baseUrl) : './',
  locale: 'en-us',
  waitSeconds: 30,
  paths: {
    'backbone-core': ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min', 'vendors/backbone/backbone'],
    bootstrap: ['//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min', 'vendors/bootstrap/dist/js/bootstrap.min'],
    text: 'vendors/requirejs-text/text',
    goog: 'vendors/requirejs-plugins/src/goog',
    async: 'vendors/requirejs-plugins/src/async',
    propertyParser: 'vendors/requirejs-plugins/src/propertyParser',
    image: 'vendors/requirejs-plugins/src/image',
    json: 'vendors/requirejs-plugins/src/json',
    hbs: 'vendors/require-handlebars-plugin/hbs',
    i18nprecompile: 'vendors/require-handlebars-plugin/hbs/i18nprecompile',
    json2: 'vendors/require-handlebars-plugin/hbs/json2',
    jquery: ['vendors/jquery/dist/jquery'],
    toastr: ['//cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.0/js/toastr.min', 'vendors/toastr/toastr.min'],
    moment: ['//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min', 'vendors/moment/min/moment-with-locales.min'],
    nprogress: ['//cdnjs.cloudflare.com/ajax/libs/nprogress/0.1.2/nprogress.min', 'vendors/nprogress/nprogress'],
    'underscore.string': ['//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min', 'vendors/underscore.string/dist/underscore.string.min'],
    bluebird: ['//cdnjs.cloudflare.com/ajax/libs/bluebird/1.2.2/bluebird.min', 'vendors/bluebird/js/browser/bluebird'],
    underscore: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.underscore.min', 'vendors/underscore/underscore-min'],
    select2: ['//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min', 'vendors/select2/select2.min'],
    numeral: ['//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.5.3/numeral.min', 'vendors/numeral/min/numeral.min'],
    ObjectId: 'vendors/ObjectId/ObjectId',
    'btn-wait': 'vendors/btn-wait/btn-wait',
    'google-api': '//apis.google.com/js/api',
    firebase: '//cdn.firebase.com/js/client/2.2.9/firebase',
    geolocator: 'vendors/geolocator/geolocator',
    facebook: '//connect.facebook.net/en_US/sdk',
    geocoder: 'vendors/geocoder/geocoder.min',
    backbone: '//cdn.firebase.com/libs/backbonefire/0.5.1/backbonefire'
  },
  hbs: {
    helpers: true,
    i18n: false,
    templateExtension: 'hbs',
    // partialsUrl: 'templates/partials',
    disableI18n: true
  },
  shim: {
    geocoder: {
      exports: 'GeocoderJS'
    },
    facebook: {
      exports: 'FB'
    },
    geolocator: {
      exports: 'geolocator'
    },
    firebase: {
      exports: 'Firebase'
    },
    'btn-wait': {
      deps: ['jquery'],
      exports: '$.fn.btnWait'
    },
    ObjectId: {
      exports: 'ObjectId'
    },
    underscore: {
      exports: '_'
    },
    select2: {
      deps: ['jquery'],
      exports: '$.fn.select2'
    },
    'backbone-core': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    backbone: {
      deps: ['backbone-core'],
      exports: 'Backbone'
    },
    toastr: {
      deps: ['jquery']
    },
    nprogress: {
      deps: ['jquery'],
      exports: 'NProgress'
    },
    bootstrap: {
      deps: ['jquery']
    },
    app: {
      deps: [
        'backbone'
      ]
    },
    router: {
      deps: [
        'nprogress'
      ]
    }
  }
});

if (!Function.prototype.bind) {
  /*eslint-disable */

  Function.prototype.bind = function (bind) {

    var self = this;
    return function () {
      var args = Array.prototype.slice.call(arguments);
      return self.apply(bind || null, args);
    };
  };
  /*eslint-enable */
}

if (typeof requirejs !== 'undefined') {
  requirejs.onError = function () {
    /*eslint-disable */
    try {
      var args = Array.prototype.slice.call(arguments);
      var console = window.console || {};
      var log = console.error || console.log || function () {};
      log.apply(console, ['requirejs error: ', args]);
    }
    catch (ignore) {}
    /*eslint-enable */

  };
}

require(['app', 'json!data/config.json', 'underscore'], function (Application, config, _) {
  window.config = _.extend(config, {
    baseUrl: window.location.origin
  });

  window.app = new Application({});

  window.app.run();
});
