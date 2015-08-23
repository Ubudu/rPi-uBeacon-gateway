'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to add
app.use(function (req, res, next) {
    res.locals.headerSection = '';
    next();
});

// Load all the routes
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
    var routerOptions = require(path.join(__dirname, 'routes', file));
    app.use(routerOptions.path, routerOptions.router);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('common/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('common/error', {
        message: err.message,
        error: {}
    });
});

// Enable LiveReload in development: whenever a static asset in /public (JS, CSS, HTML, ...) or a Jade view in /views changes, the web page is reloaded. (Works with the Chrome LiveReload plugin).
if (app.get('env') === 'development' && process.env.LIVE_RELOAD != 0) {
    var livereloadServer = require('livereload').createServer({ exts: [ 'jade' ]});
    livereloadServer.watch([__dirname + '/public', __dirname + '/views']);
}

app.set('port', process.env.PORT || 3000);

module.exports = app;
