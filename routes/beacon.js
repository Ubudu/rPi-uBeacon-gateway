'use strict';

var express = require('express');
var form = require('express-form');
var field = form.field;
var ubeacon = require('../ubeacon');
var validator = require('../lib/validators');
var router = express.Router();

/* Set the correct header section */
router.use(function(req, res, next) {
    res.locals.headerSection = 'beacon_configuration';
    next();
});

var validateForm = form(
    field('advertisingState').trim().required().toBooleanStrict(),
    field('advertisingInterval').trim().required().toInt().custom(function(val){ return validator.isInRange(val,60,10000); }),
    field('uuid').trim().required().custom(function(val){ return validator.isValidUUID.call(validator,val); }),
    field('major').trim().required().toInt().custom(function(val){ return validator.isUint16.call(validator, val); }),
    field('minor').trim().required().toInt().custom(function(val){ return validator.isUint16.call(validator, val); }),
    field('measuredStrength').trim().required().toInt().custom(function(val){ return validator.isInRange(val,-255,0); }),

    field('meshSettings.enabled').trim().required().toBooleanStrict(),
    field('meshSettings.allow_non_auth_connections').trim().required().toBooleanStrict(),
    field('meshSettings.always_connectable').trim().required().toBooleanStrict(),
    field('meshSettings.enable_mesh_window').trim().required().toBooleanStrict(),
    field('meshSettings.mesh_window_on_hour').trim().required().toInt().custom(function(val){ return validator.isInRange.call(validator,val,0,23); }),
    field('meshSettings.mesh_window_duration').trim().required().toInt().custom(function(val){ return validator.isValidMutipleOfTen.call(validator,val,0,60); }),

    field('meshNetworkUUID').trim().required().custom(validator.isValidUUID),
    field('meshDeviceId').trim().required().toInt().custom(function(val){ return validator.isInRange.call(validator,val,0x0001,0x8000); })
);

// Check that the beacon is connected
router.use(function(req, res, next) {
    if (ubeacon.serialPort.isOpen()) {
        return next();
    } else {
        return next(new Error('Beacon not connected'));
    }
});

/* GET /configure-my-beacon page */
router.get('/', function(req, res, next) {
    ubeacon.getData(function(err, beaconData) {
        if (err != null) {
            return next(err);
        }
        return res.render('beacon/index', { beaconData: beaconData });
    });
});

/* POST /configure-my-beacon */
router.post('/', validateForm, function(req, res) {
    if (!req.form.isValid) {
        ubeacon.getData(function(err, beaconData) {
            if (err != null) {
                return next(err);
            }
            return res.render('beacon/index', { beaconData: beaconData, formErrors: req.form.getErrors() });
        });
    } else {
        console.log(req.form);
        ubeacon.updateData(req.form, function(err, newBeaconData) {
            if (err != null) {
                return next(err);
            }
            return res.render('beacon/index', { beaconData: newBeaconData });
        });
    }
});

module.exports = { path: '/configure-my-beacon', router: router };