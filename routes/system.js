'use strict';

var express = require('express');
var os = require('os');
var moment = require('moment');
require('moment-duration-format');
var router = new express.Router();

var MISCONFIGURATION_MSG = 'Network interface not found. The RaspberryPi is probably misconfigured'; // eslint-disable-line

/* Set the correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'system_infos';
    next();
});

/* GET /system-infos page */
router.get('/', function(req, res) {
    var uptime = moment.duration(os.uptime(), 'seconds');
    var uptimeDuration = uptime.format('d [days] hh:mm:ss');

    var interfaces = os.networkInterfaces();

    // Select the relevant network interface
    var interfaceName = process.env.NETWORK_INTERFACE_NAME;

    var interfaceTypes;
    if (interfaces.hasOwnProperty(interfaceName)) {
        interfaceTypes = interfaces[interfaceName];
    } else {
        var err = new Error(MISCONFIGURATION_MSG);
        err.status = 500;
        return next(err);
    }

    res.render('system/index', {
        platform: os.platform(),
        uptime: uptimeDuration,
        loadavg: os.loadavg(),
        hostname: os.hostname(),
        freemem: Math.round(os.freemem() / (1024 * 1024)),
        totalmem: Math.round(os.totalmem() / (1024 * 1024)),
        interfaceTypes: interfaceTypes
    });
});

module.exports = { path: '/system-infos', router: router };
