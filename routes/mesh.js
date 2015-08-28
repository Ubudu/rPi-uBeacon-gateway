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
        process.exit();
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

router.post('/generic-messages', function(req, res, next) {
    var data = req.body;
    ubeacon.sendMeshGenericMessage(data.dstAddr, data.msg);
    data.dstAddr = parseInt(data.dstAddr);
    data.timestamp = (new Date()).getTime();
    data.msgType = 0x02;
    return res.json(data);
});

router.post('/remote-management-messages', function(req, res, next) {
    var data = req.body;

    var dataBytes = hexStringToString(data.value); // TODO Fix this
    var cmdByte = cmdBytes.hasOwnProperty(data.cmd) ? cmdBytes[data.cmd] : 0x00;
    var isGet = (data.cmdMode == 'get');

    var cmdString = ubeacon.getCommandString(isGet, cmdByte, new Buffer(dataBytes), false);
    ubeacon.sendMeshRemoteManagementMessage(parseInt(data.dstAddr, 16), cmdString.toString());

    data.dstAddr = parseInt(data.dstAddr);
    data.timestamp = (new Date()).getTime();
    data.msgType = 0x03;

    return res.json(data);
});

module.exports = { path: '/mesh-network', router: router };

var cmdBytes = {
    'mac_address': ubeacon.uartCmd.bdaddr,
    'serial_number': ubeacon.uartCmd.serialNumber,
    'battery_level': ubeacon.uartCmd.batteryLevel,
    'tx_power': ubeacon.uartCmd.txPower,
    'advertising_state': ubeacon.uartCmd.advertising,
    'proximity_uuid': ubeacon.uartCmd.uuid,
    'major': ubeacon.uartCmd.major,
    'minor': ubeacon.uartCmd.minor,
    'led_state': ubeacon.uartCmd.led,
    'rtc_time': ubeacon.uartCmd.RTCTime
};

var hexStringToString = function(hexStr)
{
    var str = '';
    for (var i = 0 ; i < hexStr.length ; i += 2) {
        str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
    }
    return str;
};
