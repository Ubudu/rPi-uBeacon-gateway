'use strict';

var express = require('express');
var os = require('os');
var router = new express.Router();

var MISCONFIGURATION_MSG = 'Network interface not found. The RaspberryPi is probably misconfigured'; // eslint-disable-line

/* Set the correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'network_infos';
    next();
});

/* GET /network-infos page */
router.get('/', function(req, res, next) {
    var interfaces = os.networkInterfaces();

    // Select the relevant network interface
    var interfaceName = process.env.NETWORK_INTERFACE_NAME;

    if (interfaces.hasOwnProperty(interfaceName)) {
        var interfaceTypes = interfaces[interfaceName];
        return res.render('network/index', { interfaceTypes: interfaceTypes });
    } else {
        var err = new Error(MISCONFIGURATION_MSG);
        err.status = 500;
        return next(err);
    }
});

module.exports = { path: '/network-infos', router: router };
