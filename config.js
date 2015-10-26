'use strict';
var path = require('path'),
  S = require('underscore.string'),
  rootPath = path.normalize(__dirname + '/..');

module.exports = {
  rootPath: rootPath,
  isTestEnv: process.env.NODE_ENV === 'test',
  sharedSecret: process.env.LM_SHARED_SECRET,
  app: {
    name: 'let-us-meet',
    fullName: 'Let\'s Meet',
    version: process.env.LM_VERSION,
    refreshInterval: 5 * 60,
    frontend: process.env.LM_FRONTEND_URL,
    backend: process.env.LM_BACKEND_URL,
    systemMessage: process.env.LM_SYSTEM_MESSAGE,
    domain: 'let-us-meet.com'
  },
  mongo: {
    url: process.env.MONGOLAB_URI,
    options: {
      debug: S.toBoolean(process.env.MONGOLAB_DEBUG_ENABLED)
    }
  },
  bonsai: {
    url: process.env.BONSAI_URL,
    interval: process.env.LM_DOCUMENT_INDEX_INTERVAL_SECONDS || 300,
    log: process.env.BONSAI_LOG_LEVEL || 'error'
  },
  support: {
    email: process.env.LM_SUPPORT_EMAIL
  },
  gtm: {
    isEnabled: S.toBoolean(process.env.GTM_ENABLED),
    dataLayerName: process.env.GTM_DATA_LAYER_NAME || 'dataLayer',
    containerId: process.env.GTM_CONTAINER_ID
  },
  google: {
    key: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_API_CLIENT_ID,
    clientSecret: process.env.GOOGLE_API_SECRET,
    browserApiKey: process.env.GOOGLE_BROWSER_API_KEY,
    redirectUrl: '/session/login/callback',
    scopes: [
      'https://www.googleapis.com/auth/plus.login',
      'email',
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.readonly',
      'https://www.googleapis.com/auth/admin.directory.orgunit.readonly'
    ]
  },
  mail: {
    port: process.env.MAILGUN_SMTP_PORT,
    host: process.env.MAILGUN_SMTP_SERVER,
    debug: process.env.MAILGUN_DEBUG_ENABLED,
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD
    }
  },
  redis: {
    url: process.env.REDISTOGO_URL
  },
  session: {
    secret: process.env.LM_SESSION_SECRET
  },
  emailTemplate: {
    viewEngine: {
      extname: '.hbs',
      layoutsDir: 'views/email/',
      defaultLayout: 'template',
      partialsDir: 'views/partials/'
    },
    viewPath: 'views/email/',
    extName: '.hbs'
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    apiVersion: process.env.FACEBOOK_API_VERSION
  },
  firebase: {
    isEnabled: S.toBoolean(process.env.FIREBASE_ENABLED),
    url: process.env.FIREBASE_URL
  },
  sabre: {
    authToken: process.env.SABRE_AUTH_TOKEN,
    baseUrl: process.env.SABRE_BASE_URL
  }

};