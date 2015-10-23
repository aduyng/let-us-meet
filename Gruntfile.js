'use strict';

var path = require('path');
var url = require('url');

module.exports = function (grunt) {
    var env = grunt.option('env') || 'development',
        _ = require('underscore'),
        backendOptions = require('./backend.json'),
        frontendPath = grunt.option('frontend-path') || ('./firebase/' + backendOptions.GTP_VERSION),
        backendPath = grunt.option('backend-path') || './heroku';


    console.log('env=' + env + '; tasks=' + JSON.stringify(grunt.cli.tasks));

    if (!backendOptions.PORT) {
        backendOptions.PORT = url.parse(backendOptions.GTP_BACKEND_URL).port || 80;
    }


    var requireJsOptions = {};
    var concurrentOptions = {
        frontend: {
            tasks: ['http-server:frontend', 'watch:frontend'],
            options: {
                limit: 2,
                logConcurrentOutput: true
            }
        },
        backend: {
            tasks: ['shell:start-backend', 'watch:backend'],
            options: {
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
                './app/**/*.less'
            ],
            tasks: [
                'less:frontend'
            ]
        },
        backend: {
            files: [
                'controllers/**/*.js',
                'odm/**/*.js',
                'routes/**/*.js',
                'views/**/*.js',
                'error.js',
                'config.js',
                'cache.js',
                'gclient.js',
                'logger.js',
                'mailer.js',
                'server.js',
                'utils.js',
                'Procfile'
            ],
            tasks: [
                'shell:stop-backend',
                'shell:start-backend'
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
            formValidationCore: 'vendors/formvalidation/js/formValidation',
            formValidation: 'vendors/formvalidation/js/framework/bootstrap.min',
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
            datetimepicker: 'empty:',
            numeral: 'empty:',
            ObjectId: 'vendors/ObjectId/ObjectId',
            'btn-wait': 'vendors/btn-wait/btn-wait',
            'google-api': 'empty:',
            firebase: 'empty:'
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
        waitSeconds: 30,
        skipSemiColonInsertion: false,
        wrapShim: true
    };


    _.forEach(['init'], function (moduleName) {
        requireJsOptions[moduleName] = {
            options: _.extend({}, defaultRequireJsModuleOptions, {
                name: moduleName,
                include: [
                    'app',
                    'router',
                    'views/layout',
                    'views/nav',
                    'views/page',

                    'logger',
                    'ObjectId',

                    //pages
                    'pages/index/index'
                ],
                exclude: [],
                out: ['./tmp', moduleName + '.js'].join('/')
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
            heroku: {
                src: [
                    backendPath
                ]
            },
            firebase: {
                src: [
                    frontendPath
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
                        'images/*'
                    ]
                }, {
                    expand: true,
                    cwd: './app/vendors/bootstrap-colorpicker/dist/img/bootstrap-colorpicker',
                    dest: frontendPath + '/images/bootstrap-colorpicker',
                    src: [
                        '*.png'
                    ]
                }]
            },
            backend: {
                files: [{
                    expand: true,
                    cwd: './',
                    dest: backendPath,
                    src: [
                        './controllers/*.js',
                        './directory/**/*.js',
                        './jobs/*.js',
                        './models/**/*.js',
                        './odm/**/*.js',
                        './routes/*.js',
                        './views/**/*.hbs',
                        './acl.js',
                        './agenda.js',
                        './cache.js',
                        './config.js',
                        './error.js',
                        './firebase.js',
                        './gclient.js',
                        './indexer.js',
                        './logger.js',
                        './mailer.js',
                        './newrelic.js',
                        './package.json',
                        './Procfile',
                        './server.js',
                        './utils.js',
                        './worker.js'
                    ]
                }]
            }
        },
        less: {
            frontend: {
                options: {
                    ieCompat: false,
                    compress: false,
                    plugins: [
                        new (require('less-plugin-autoprefix'))({browsers: ['last 2 versions']}),
                        new (require('less-plugin-clean-css'))({
                            advanced: false,
                            keepBreaks: true,
                            keepSpecialComments: '*'
                        })
                    ]
                },
                files: (function () {
                    var files = {};
                    files['app/style.css'] = 'app/style.less';
                    files['app/style.ie.css'] = 'app/style.ie.less';
                    return files;
                })()
            }
        },
        shell: {
            'start-frontend': {
                command: './start-frontend.sh',
                options: {
                    stdout: true,
                    async: true,
                    failOnError: true,
                    execOptions: {}
                }
            },
            'start-backend': {
                command: _.map(backendOptions, function (value, key) {
                    return key + '="' + value + '"';
                }).concat('foreman start').join(' '),
                options: {
                    stdout: true,
                    async: false,
                    failOnError: true,
                    execOptions: {}
                }
            },
            'stop-backend': {
                command: 'kill `pidof node` || true > /dev/null & kill `pidof foreman` & kill `pidof foreman-runner`',
                options: {
                    stderr: false,
                    failOnError: false,
                    async: false,
                    execOptions: {}
                }
            }
        },
        concurrent: concurrentOptions,
        'http-server': {
            frontend: {
                root: 'app',
                port: process.env.PORT,
                host: process.env.IP,
                cache: -1,
                showDir: true,
                autoIndex: false,
                runInBackground: false,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
                }
            }
        },
        env: {
            test: _.extend({}, backendOptions, {NODE_ENV: 'test'})
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
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    grunt.registerTask('frontend', function () {
        grunt.task.run([
            'less:frontend',
            'concurrent:frontend'
        ]);
    });

    grunt.registerTask('backend', function () {
        grunt.task.run([
            'shell:stop-backend',
            'shell:start-backend'
        ]);
    });

    grunt.registerTask('stop', function () {
        grunt.task.run([
            'shell:stop-backend'
        ]);
    });

    grunt.registerTask('build-frontend', function () {
        grunt.task.run([
            'requirejs',
            'uglify:frontend',
            'less:frontend',
            'copy:frontend'
        ]);
    });

    grunt.registerTask('build-backend', function () {
        grunt.task.run([
            'copy:backend'
        ]);
    });
};
