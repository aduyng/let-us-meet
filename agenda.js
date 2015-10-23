'use strict';
var config = require('./config'),
  B = require('bluebird'),
  L = require('./logger'),
  _ = require('underscore'),
  odm = require('./odm/odm'),
  Agenda = require('agenda');


var agenda = new Agenda(_.extend({}, config.agenda, {
  db: {
    address: config.mongo.url,
    collection: 'jobs'
  }
}));

agenda.initialize = function() {
  var modules = ['directory-sync', 'workflow', 'elastic-search', 'example', 'reminder', 'document'];
  _.forEach(modules, function(module) {
    require('./jobs/' + module)(agenda);
  });
  if (modules.length) {
    return B.all([odm.initialize()])
      .then(function() {
        //check if reminder job is there
        return B.promisify(agenda.jobs, agenda)({
          name: 'reminder:daily-pending-items'
        })
          .then(function(jobs) {
            var job;
            if (_.isEmpty(jobs)) {
              job = agenda.create('reminder:daily-pending-items');
              job.schedule(config.agenda.runReminderAt);
              job.repeatAt(config.agenda.runReminderAt);
              return B.promisify(job.save, job)();
            }
            return B.resolve(job);
          });
      });
  }
  return B.resolve();
};

module.exports = agenda;
