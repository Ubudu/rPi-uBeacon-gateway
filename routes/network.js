'use strict';

var express = require('express');
var os = require('os');
var router = express.Router();

/* Set the correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'network_infos';
    next();
});

/* GET /network-infos page */
router.get('/', function(req, res, next) {
    var networkInterfaces = os.networkInterfaces();
    console.log(networkInterfaces);

    // Select the relevant network interface
    var networkInterfaceName = process.env.NETWORK_INTERFACE_NAME;

    if (networkInterfaces.hasOwnProperty(networkInterfaceName)) {
        var networkInterfaceTypes = networkInterfaces[networkInterfaceName];
        return res.render('network/index', { networkInterfaceTypes: networkInterfaceTypes });
    } else {
        var err = new Error('Network interface not found. The RaspberryPi is probably misconfigured');
        err.status = 500;
        return next(err);
    }
});

module.exports = { path: '/network-infos', router: router };