'use strict';
/*global requirejs*/
requirejs.config({
    baseUrl: (typeof window !== 'undefined' && window.config !== undefined && window.config.baseUrl !== undefined) ? (window.config.baseUrl) : './',
    locale: 'en-us',
    waitSeconds: 30,
    paths: {
        filepicker: '//api.filepicker.io/v2/filepicker',
        backbone: ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min', 'vendors/backbone/backbone'],
        bootstrap: ['//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min', 'vendors/bootstrap/dist/js/bootstrap.min'],
        colorpicker: ['//cdnjs.cloudflare.com/ajax/libs/bootstrap-colorpicker/2.0.0/js/bootstrap-colorpicker', 'vendors/bootstrap-colorpicker/dist/js/bootstrap-colorpicker'],
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
        formValidationCore: 'vendors/formvalidation/js/formValidation.min',
        formValidation: 'vendors/formvalidation/js/framework/bootstrap.min',
        toastr: ['//cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.0/js/toastr.min', 'vendors/toastr/toastr.min'],
        moment: ['//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min', 'vendors/moment/min/moment-with-locales.min'],
        nprogress: ['//cdnjs.cloudflare.com/ajax/libs/nprogress/0.1.2/nprogress.min', 'vendors/nprogress/nprogress'],
        'underscore.string': ['//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min', 'vendors/underscore.string/dist/underscore.string.min'],
        bluebird: ['//cdnjs.cloudflare.com/ajax/libs/bluebird/1.2.2/bluebird.min', 'vendors/bluebird/js/browser/bluebird'],
        scrollTo: ['//cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/1.4.11/jquery.scrollTo.min', 'vendors/jquery.scrollTo/jquery.scrollTo.min'],
        geometry: ['vendors/joint/src/geometry'],
        vectorizer: ['vendors/joint/src/vectorizer'],
        joint: 'vendors/joint/dist/joint.clean',
        underscore: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.underscore.min', 'vendors/underscore/underscore-min'],
        lodash: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min', 'vendors/lodash/dist/lodash'],
        select2: ['//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min', 'vendors/select2/select2.min'],
        'jqueryui-core': ['//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min', 'vendors/jquery-ui/jquery-ui.min'],
        jqueryui: ['//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min', 'vendors/jquery.ui.touch-punch/jquery.ui.touch-punch.min'],
        datetimepicker: ['//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.0.0/js/bootstrap-datetimepicker.min', 'vendors/bootstrap-datetimepicker/bootstrap-datetimepicker.min'],
        'text-complete': ['//cdnjs.cloudflare.com/ajax/libs/jquery.textcomplete/0.2.2/jquery.textcomplete.min', 'vendors/jquery.textcomplete/jquery.textcomplete.min'],
        overlay: 'vendors/jquery-overlay/jquery-overlay.min',
        markdown: ['//cdnjs.cloudflare.com/ajax/libs/markdown.js/0.5.0/markdown.min', 'vendors/markdown-js/dist/markdown'],
        amplify: ['//cdnjs.cloudflare.com/ajax/libs/amplifyjs/1.1.2/amplify.min', 'vendors/amplify/lib/amplify.min'],
        numeral: ['//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.5.3/numeral.min', 'vendors/numeral/min/numeral.min'],
        ObjectId: 'vendors/ObjectId/ObjectId',
        'btn-wait': 'vendors/btn-wait/btn-wait',
        transit: ['//cdnjs.cloudflare.com/ajax/libs/jquery.transit/0.9.12/jquery.transit.min', 'vendors/jquery.transit/jquery.transit'],
        'google-api': '//apis.google.com/js/api',
        firebase: '//cdn.firebase.com/js/client/2.2.9/firebase',
        geolocator: 'vendors/geolocator/geolocator',
        facebook: '//connect.facebook.net/en_US/sdk'
    },
    hbs: {
        helpers: true,
        i18n: false,
        templateExtension: 'hbs',
        // partialsUrl: 'templates/partials',
        disableI18n: true
    },
    shim: {
        facebook: {
            exports: 'FB'
        },
        geolocator: {
            exports: 'geolocator'
        },
        firebase: {
            exports: 'Firebase'
        },
        colorpicker: {
            deps: ['bootstrap'],
            exports: '$.fn.colorpicker'
        },
        transit: {
            deps: ['jquery'],
            exports: '$.fn.transition'
        },
        'text-complete': {
            deps: ['jquery'],
            exports: '$.fn.textcomplete'
        },
        overlay: {
            deps: ['jquery'],
            exports: '$.fn.overlay'
        },
        'btn-wait': {
            deps: ['jquery'],
            exports: '$.fn.btnWait'
        },
        markdown: {
            exports: 'markdown'
        },
        ObjectId: {
            exports: 'ObjectId'
        },
        underscore: {
            exports: '_'
        },
        lodash: {
            exports: '_'
        },
        select2: {
            deps: ['jquery'],
            exports: '$.fn.select2'
        },
        jqueryui: {
            deps: ['jquery', 'jqueryui-core']
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        toastr: {
            deps: ['jquery']
        },
        scrollTo: {
            deps: ['jquery']
        },
        nprogress: {
            deps: ['jquery'],
            exports: 'NProgress'
        },
        datetimepicker: {
            deps: ['jquery', 'moment', 'bootstrap'],
            exports: '$.fn.datetimepicker'
        },
        bootstrap: {
            deps: ['jquery']
        },
        'jquery.cookie': {
            deps: ['jquery']
        },
        formValidationCore: {
            deps: ['jquery']
        },
        'formValidation': {
            deps: ['jquery', 'formValidationCore'],
            exports: '$.fn.formValidation'
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
            var log = console.error || console.log || function () {
                };
            log.apply(console, ['requirejs error: ', args]);
        } catch (ignore) {
        }
        /*eslint-enable */

    };
}

require(['app'], function (Application) {
    window.app = new Application({});
    window.app.run();
});
