'use strict';

var express = require('express');
var ubeacon = require('../ubeacon');
var observer = require('node-observer');
var router = express.Router();

/* Set correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'mesh_network';
    next();
});

// Check that the beacon is connected
router.use(function(req, res, next) {
    if (ubeacon.serialPort.isOpen()) {
        return next();
    } else {
        return next(new Error('Beacon not connected'));
    }
});

router.get('/', function(req, res, next) {
    ubeacon.getData(function(err, beaconData) {
        if (err != null) {
            return next(err);
        }
        return res.render('mesh/index', { beaconData: beaconData });
    });
});

router.post('/messages', function(req, res, next) {
    var data = req.body;
    ubeacon.sendMeshGenericMessage(data.dstAddr, data.msg);
    data.dstAddr = parseInt(data.dstAddr);
    data.timestamp = (new Date()).getTime();
    data.msgType = 0x02;
    return res.json(data);
});

module.exports = { path: '/mesh-network', router: router };
