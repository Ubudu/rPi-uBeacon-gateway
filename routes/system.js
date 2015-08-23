'use strict';

var express = require('express');
var os = require('os');
var moment = require('moment');
require('moment-duration-format');
var router = express.Router();

/* Set the correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'system_infos';
    next();
});

/* GET /system-infos page */
router.get('/', function(req, res) {
    var uptime = moment.duration(os.uptime(), 'seconds');
    var uptimeDuration = uptime.format('d [days] hh:mm:ss');

    res.render('system/index', {
        platform: os.platform(),
        uptime: uptimeDuration,
        loadavg: os.loadavg(),
        hostname: os.hostname(),
        freemem: Math.round(os.freemem() / (1024 * 1024)),
        totalmem: Math.round(os.totalmem() / (1024 * 1024))
    });
});

module.exports = { path: '/system-infos', router: router };