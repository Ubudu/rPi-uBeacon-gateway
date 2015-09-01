'use strict';

var express = require('express');
var ubeacon = require('../ubeacon');
var router = new express.Router();

var hexStringToString = function(hexStr)  {
  var str = '';
  for (var i = 0 ; i < hexStr.length ; i += 2) {
    var c = String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
    str += c;
  }
  return str;
};

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

router.post('/generic-messages', function(req, res) {
  var data = req.body;
  data.dstAddr = parseInt(data.dstAddr, 16);
  ubeacon.sendMeshGenericMessage(data.dstAddr, data.msg);
  data.timestamp = (new Date()).getTime();
  data.msgType = 0x02;
  return res.json(data);
});

router.post('/remote-management-messages', function(req, res) {
  var data = req.body;

  var dataBytes = hexStringToString(data.value);
  var cmdByte = cmdBytes.hasOwnProperty(data.cmd) ? cmdBytes[data.cmd] : 0xFF;

  var isGet = (data.cmdMode === 'get');

  var cmdBuffer = ubeacon.getCommandString(isGet, cmdByte, new Buffer(dataBytes), false); // eslint-disable-line

  ubeacon.sendMeshRemoteManagementMessage(parseInt(data.dstAddr, 16), cmdBuffer.toString(), function() { // eslint-disable-line
    console.log(arguments);
  });

  data.dstAddr = parseInt(data.dstAddr, 16);
  data.timestamp = (new Date()).getTime();
  data.msgType = 0x03;

  return res.json(data);
});

module.exports = { path: '/mesh-network', router: router };
