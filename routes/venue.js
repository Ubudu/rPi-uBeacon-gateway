'use strict';

var express = require('express');
var fs = require('fs');
var request = require('request');
var async = require('async');
var db = require('../db');
var router = new express.Router();
var debug = require('debug')('web');

var credentialsPath = __dirname + '/../credentials.json';

/* Set the correct header section */
router.use(function(req, res, next) {
  res.locals.headerSection = 'venue_infos';
  next();
});

/* Checks if the user is authenticated */
router.use(function(req, res, next) {
  fs.exists(credentialsPath, function(exists) {
    if (exists) {
      var credentials = require(credentialsPath);
      if (credentials.token !== null) {
        return next();
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  });
});

/* GET venue infos page. */
router.get('/', function(req, res) {
  // Load the credentials
  var credentials = require('../credentials.json');
  var token = credentials.token;

  async.parallel({
    selectedVenue: function(callback) {
      db.venues.findOne({ selected: true }, function(err, selectedVenue) {
        if (err) {
          return callback(err);
        }

        // We get the list of beacons for the venue
        var options = {
          uri: 'https://manager.ubudu.com/u_venues/' + selectedVenue.id + '/u_beacon_devices.json',
          method: 'GET',
          json: true,
          qs: { access_token: token }
        };
        request.get(options, function(err, response, body) {
          console.log(body);
          if (err) {
            return callback(err);
          }
          async.eachSeries(body.u_beacon_devices, function(remoteUBeaconDevice, callback2) {
            debug('upserting', remoteUBeaconDevice);
            // Upsert each UBeacon device
            db.nodes.update({ id: remoteUBeaconDevice.id }, { $set: remoteUBeaconDevice }, { upsert: true }, callback2);
          }, function(err) {
            if (err) {
              return callback(err);
            }
            db.nodes.find({ u_venue_id: selectedVenue.id }, function(err, nodes) {
              if (err) {
                return next(err);
              }
              selectedVenue.nodes = nodes;
              callback(null, selectedVenue);
            });
          });
        });
      });
    },
    availableVenues: function(callback) {
      // We get the list of venues
      var options = {
        uri: 'https://manager.ubudu.com/u_venues.json',
        method: 'GET',
        json: true,
        qs: { access_token: token }
      };
      request.get(options, function(err, response, body) {
        if (err) {
          return callback(err);
        }
        async.eachSeries(body.u_venues, function(remoteVenue, callback2) {
          // Upsert each venue
          db.venues.update({ id: remoteVenue.id }, { $set: remoteVenue }, { upsert: true }, callback2);
        }, function(err) {
          if (err) {
            return callback(err);
          }
          db.venues.find({}, callback);
        });
      });
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('venue/index', {
      selectedVenue: results.selectedVenue,
      availableVenues: results.availableVenues
    });
  });
});

router.post('/', function(req, res, next) {
  var venueId = req.body.venue;

  console.log('venue Id', venueId);

  async.series([
      function(callback) {
        db.venues.update({ selected: true }, { $set: { selected: false } }, callback);
      },
      function(callback) {
        db.venues.update({ _id: venueId }, { $set: { 'selected': true } }, callback);
      }
  ], function(err) {
    if (err) {
      return next(err);
    }
    return res.redirect('/venue-infos');
  });
});

module.exports = { path: '/venue-infos', router: router };
