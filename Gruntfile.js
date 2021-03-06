'use strict';
var path = require('path');
var url = require('url');
var _ = require('lodash');
var config = require('./app/data/config.json');

module.exports = function (grunt) {
  var isProductionMode = grunt.option('env') === 'production';

  var frontendPath = './dist';

  var requireJsOptions = {};
  var concurrentOptions = {
    frontend: {
      tasks: ['http-server:frontend', 'watch:frontend'],
      options: {
        limit: 2,
        logConcurrentOutput: true
      }
    }
  };
  var watchOptions = {
    options: {
      // livereload: true
    },
    'frontend': {
      files: [
        './app/**/*.less',
        './app/**/*.js',
        './app/**/*.json',
        './app/**/*.hbs'
      ],
      tasks: [
      'compile'
      ]
    }
  };

  var defaultRequireJsModuleOptions = {
    mainConfigFile: 'app/init.js',
    packages: [],
    keepBuildDir: true,
    locale: 'en-us',
    optimize: 'none',
    skipDirOptimize: true,
    generateSourceMaps: false,
    normalizeDirDefines: 'skip',
    paths: {
      'backbone-core': 'empty:',
      backbone: 'empty:',
      bootstrap: 'empty:',
      text: 'vendors/requirejs-text/text',
      goog: 'vendors/requirejs-plugins/src/goog',
      async: 'vendors/requirejs-plugins/src/async',
      propertyParser: 'vendors/requirejs-plugins/src/propertyParser',
      image: 'vendors/requirejs-plugins/src/image',
      json: 'vendors/requirejs-plugins/src/json',
      hbs: 'vendors/require-handlebars-plugin/hbs',
      i18nprecompile: 'vendors/require-handlebars-plugin/hbs/i18nprecompile',
      json2: 'vendors/require-handlebars-plugin/hbs/json2',
      jquery: 'vendors/jquery/dist/jquery',
      toastr: 'empty:',
      moment: 'empty:',
      nprogress: 'empty:',
      'underscore.string': 'empty:',
      bluebird: 'empty:',
      scrollTo: 'empty:',
      underscore: 'empty:',
      lodash: 'empty:',
      select2: 'empty:',
      'jqueryui-core': 'empty:',
      jqueryui: 'empty:',
      numeral: 'empty:',
      ObjectId: 'vendors/ObjectId/ObjectId',
      'btn-wait': 'vendors/btn-wait/btn-wait',
      'google-api': 'empty:',
      firebase: 'empty:',
      facebook: 'empty:',
      geolocator: 'vendors/geolocator'
    },
    optimizeCss: 'none',
    cssImportIgnore: null,
    cssPrefix: '',
    inlineText: true,
    useStrict: true,
    has: {
      'function-bind': true,
      'string-trim': false
    },
    hasOnSave: {
      'function-bind': true,
      'string-trim': false
    },
    skipPragmas: false,
    skipModuleInsertion: false,
    stubModules: ['text', 'hbs', 'json'],
    optimizeAllPluginResources: false,
    findNestedDependencies: false,
    removeCombined: false,
    wrap: true,
    fileExclusionRegExp: /^\./,
    preserveLicenseComments: false,
    logLevel: 0,
    throwWhen: {
      //If there is an error calling the minifier for some JavaScript,
      //instead of just skipping that file throw an error.
      optimize: true
    },
    cjsTranslate: true,
    useSourceUrl: false,
    generateSourceMaps: !isProductionMode,
    waitSeconds: 30,
    skipSemiColonInsertion: false,
    wrapShim: true
  };


  _.forEach(['init'], function (moduleName) {
    requireJsOptions[moduleName] = {
      options: _.extend({}, defaultRequireJsModuleOptions, {
        name: moduleName,
        include: [
          'logger',
          'ObjectId',
          'geolocator',

          'app',
          'router',
          'views/layout',
          'views/page',

          //pages
          'pages/index/index'
        ],
        exclude: [],
        out: [isProductionMode ? './tmp' : frontendPath, moduleName + '.js'].join('/')
      })
    };
  });

  var opts = {
    watch: watchOptions,
    requirejs: requireJsOptions,
    clean: {
      options: {
        force: true
      },
      firebase: {
        src: [
          frontendPath,
          './tmp'
        ]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      frontend: {
        files: [{
          expand: true,
          cwd: './app',
          dest: frontendPath,
          src: [
            'images/icon/*',
            'images/**/*.png',
            'images/**/*.jpg'
          ]
        }, {
          dest: frontendPath + '/index.html',
          src: './app/index.html'
        }, {
          dest: frontendPath + '/vendors/geocoder.js',
          src: './app/vendors/geocoder.js'
        }]
      }
    },
    less: {
      frontend: {
        options: {
          ieCompat: false,
          compress: false,
          plugins: [
            new(require('less-plugin-autoprefix'))({
              browsers: ['last 2 versions']
            }),
            new(require('less-plugin-clean-css'))({
              advanced: false,
              keepBreaks: true,
              keepSpecialComments: '*'
            })
          ]
        },
        files: (function () {
          var files = {};
          files[frontendPath + '/style.css'] = 'app/style.less';
          files[frontendPath + '/style.ie.css'] = 'app/style.ie.less';
          return files;
        })()
      }
    },
    concurrent: concurrentOptions,
    'http-server': {
      frontend: {
        root: frontendPath,
        port: process.env.PORT || 11000,
        host: process.env.IP || '0.0.0.0',
        cache: -1,
        showDir: true,
        autoIndex: false,
        runInBackground: false
      }
    },
    uglify: {
      options: {
        output: {
          beautify: false
        },
        screwIE8: true,
        report: 'min',
        sourceMap: false,
        compress: {
          /*eslint-disable */
          sequences: true, // join consecutive statemets with the â€œcomma operatorâ€
          properties: true, // optimize property access: a['foo'] â†’ a.foo
          dead_code: true, // discard unreachable code
          drop_debugger: true, // discard â€œdebuggerâ€ statements
          drop_console: true,
          unsafe: false, // some unsafe optimizations (see below)
          conditionals: true, // optimize if-s and conditional expressions
          comparisons: true, // optimize comparisons
          evaluate: true, // evaluate constant expressions
          booleans: true, // optimize boolean expressions
          loops: true, // optimize loops
          unused: true, // drop unused variables/functions
          hoist_funs: true, // hoist function declarations
          hoist_vars: false, // hoist variable declarations
          if_return: true, // optimize if-s followed by return/continue
          join_vars: true, // join var declarations
          cascade: true, // try to cascade `right` into `left` in sequences
          side_effects: true, // drop side-effect-free statements
          warnings: true, // warn about potentially dangerous optimizations/code
          global_defs: {
            DEBUG: false
          } // global definitions
          /*eslint-enable */
        }
      },
      frontend: {
        files: (function () {
          var files = {};

          files[[frontendPath, 'init.js'].join('/')] = './tmp/init.js';
          return files;
        })()
      }
    }
  };

  grunt.initConfig(opts);
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask('build', function () {
    grunt.task.run([
      'requirejs',
      'uglify:frontend',
      'less:frontend',
      'copy:frontend'
    ]);
  });

  grunt.registerTask('compile', function () {
    var tasks = [
      'clean',
      'requirejs',
      ];
    if (isProductionMode) {
      tasks.push('uglify:frontend');
    }
    tasks.push('less:frontend', 'copy:frontend');
    grunt.task.run(tasks);
  });

  grunt.registerTask('default', function () {
    var tasks = ['compile'];
    if (!isProductionMode) {
      tasks.push('concurrent:frontend');
    }
    grunt.task.run(tasks);
  });
};
