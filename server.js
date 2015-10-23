'use strict';

var env = process.env.NODE_ENV || 'development',
    config = require('./config'),
    fs = require('fs'),
    express = require('express'),
    url = require('url'),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    S = require('underscore.string'),
    odm = require('./odm/odm'),
    app = express(),
    User = require('./odm/models/user'),
    B = require('bluebird'),
    checkit = require('checkit'),
    AppError = require('./error'),
    load = require('express-load'),
    L = require('./logger'),
    U = require('./utils'),
    colors = require('colors'),
    responseTime = require('response-time'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    compression = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    expressSanitizer = require('express-sanitizer'),
    https = require('https'),
    privateKey = fs.readFileSync('ssl/server.key', 'utf8'),
    certificate = fs.readFileSync('ssl/server.crt', 'utf8'),
    credentials = {key: privateKey, cert: certificate};

app.use(responseTime(function (req, res, time) {
    L.infoAsync(S.sprintf('==================%s %s COMPLETED in %s==============', req.method, req.url, time.toFixed(2)).blue);
}));

app.use(expressSanitizer());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser());

app.disable('etag');

app.engine('hbs', exphbs({
    defaultLayout: false,
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(session({
    secret: config.session.secret,
    store: new RedisStore(config.redis),
    saveUninitialized: false,
    resave: true
}));

//app.use(app.router);


app.use(function (err, req, res, next) {
    var errClassName = err.name;
    if (err instanceof checkit.Error) {
        errClassName = 'Checkit.Error';
    }
    else if (err instanceof AppError) {
        errClassName = 'AppError';
    }

    switch (errClassName) {
    case 'AppError':
        res.send(err.code, {
            type: 'AppError',
            message: err.message || 'Unknown',
            data: err.data
        });
        break;
        //db validation errors
    case 'Checkit.Error':
        res.send(400, {
            type: 'ValidationError',
            message: err.message,
            data: err.toJSON()
        });
        break;
    default:
        if (err.message) {
            L.errorAsync(errClassName, err.message, _.result(err, 'trace'));
        }
        else {
            L.errorAsync(err);
        }

        res.send((err || {}).errorCode || 500, {
            type: 'Unknown',
            message: 'Something broke!'
        });
        break;
    }
});

app.all('*', function (req, res, next) {
    L.infoAsync(S.sprintf('=================%s %s STARTED==============', req.method, req.url).yellow);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Version');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');


    if (req.headers['x-version'] && parseInt(req.headers['x-version'], 10) !== config.app.version) {
        res.send(426);
        return;
    }
    req = U.sanitizeReqObject(req);

    if (!req.body) {
        req.body = {};
    }
    if (req.session && req.session.userId) {
        req.user = new User(req.session.user);
    }
    next();
});

load('controllers').then('routes').into(app);

app.start = function () {
    var httpsServer = https.createServer(credentials, app);
    return B.all([odm.initialize()])
        .then(function () {
            app.server = httpsServer.listen(process.env.PORT, function () {
                L.infoAsync(S.repeat('=', 80).red);
                L.infoAsync('API is listening at %s', config.app.backend);
                L.infoAsync('Frontend is listening at %s', config.app.frontend);
            });
        });
};


if (!config.isTestEnv) {
    app.start();
}
module.exports = app;