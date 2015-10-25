'use strict';
var config = require('./config'),
  B = require('bluebird'),
  _ = require('underscore'),
  moment = require('moment'),
  L = require('./logger'),
  S = require('underscore.string'),
  nodemailer = require('nodemailer'),
  hbs = require('nodemailer-express-handlebars'),
  smtpTransport = require('nodemailer-smtp-pool');

var Mailer = function(options) {
  var opts = _.extend({}, config.mail, options);
  this.transporter = B.promisifyAll(nodemailer.createTransport(smtpTransport(opts)));
  this.transporter.use('compile', hbs(config.emailTemplate));
};

Mailer.prototype.send = function(options) {
  var that = this;
  options = options || {};
  options.context = options.context || {};
  _.extend(options.context, {
    appName: config.app.fullName,
    frontend: [config.app.frontend, config.app.version].join('/'),
    backend: config.app.backend
  });

  if (process.env.LM_EMAIL_DEFAULT_RECIPIENT) {
    L.warnAsync('recipient %s has been replaced by %s=%s', options.to, 'process.env.LM_EMAIL_DEFAULT_RECIPIENT', process.env.LM_EMAIL_DEFAULT_RECIPIENT);
    options.to = process.env.LM_EMAIL_DEFAULT_RECIPIENT;
    options.cc = '';
    options.bcc = '';
  }

  if (S.toBoolean(process.env.LM_EMAIL_DELIVERY_ACTIVE)) {
    L.infoAsync('with subject "%s" has been sent to %s', options.subject, options.to);
    return that.transporter.sendMailAsync(options);
  }

  L.warnAsync('email to %s has been turned off because %s=%s', options.to, 'process.env.LM_EMAIL_DELIVERY_ACTIVE', process.env.LM_EMAIL_DELIVERY_ACTIVE);

  return B.resolve(true);
};

module.exports = Mailer;
