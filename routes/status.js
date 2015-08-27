'use strict';

var express= require('express');
var router = express.Router();
var ubeacon = require('../ubeacon');

router.get('/', function(req, res, next) {
    var data = {
        ubeacon: {}
    };

    data.ubeacon.connected = ubeacon.serialPort.isOpen();

    // TODO Maybe add other status infos

    return res.json(data);
});

module.exports = { path: '/status', router: router };