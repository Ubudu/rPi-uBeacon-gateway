'use strict';

var express = require('express');
var router = new express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('home/index', { title: 'Express' });
});

module.exports = { path: '/', router: router };
