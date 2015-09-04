'use strict';
var DataStore = require('nedb');

var db = {};
db.venues = new DataStore({ filename: __dirname + '/../data/venues.db', autoload: true });
db.nodes = new DataStore({ filename: __dirname + '/../data/nodes.db', autoload: true });

module.exports = db;