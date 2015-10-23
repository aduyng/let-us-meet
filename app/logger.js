'use strict';
define(function(require) {
  var _ = require('underscore');

  var Me = {};
  var methods = ['clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed',
    'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp',
    'trace', 'warn'];

  _.forEach(methods, function(method) {
    Me[method] = function() {
      if (!window.console) {
        window.console = {};
      }
      if (!window.console[method]) {
        window.console[method] = function() {
          window.console.log(method, arguments);
        };
      }
      var stack;
      try {
        throw new Error('dummy');
      } catch (e) {
        stack = '\n' + _.map(_.filter((e.stack || '').split('\n'), function(line) {
          return line.trim().match(/\(\/.+?\)/i);
        }), function(line) {
          return line.trim();
        }).splice(1).join('\n\t');
      }

      return _.defer(function() {
        var args = _.filter(arguments[0], function(arg, index) {
          return _.isNumber(index);
        });
        args.push(stack);
        if (typeof window.console[method] === 'function') {
          window.console[method].apply(window.console, args);
        }else{
          window.console.log(args);
        }

      }, arguments);

    };
  });


  return Me;
});
