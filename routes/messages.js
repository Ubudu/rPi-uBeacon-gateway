'use strict';

var express = require('express');
var router = new express.Router();
var observer = require('node-observer');

/* Set correct header section */
router.use(function(req, res, next) {
  res.locals.headerSection = 'messages';
  next();
});

router.get('/', function(req, res, next) {
  return res.render('messages/index');
});

router.post('/', function(req, res) {
  var data = req.body;
  observer.send(this, 'messages:message', data);
  return res.json(data);
});

module.exports = { path: '/messages', router: router };
