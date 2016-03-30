'use strict';

var express = require('express');
var router = new express.Router();
var observer = require('node-observer');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('home/index', { title: 'Express' });
});

/* GET welcome VIP */
router.get('/welcome', function(req, res, next) {
  var username = req.query.user_name;

  console.log(req.query);

  observer.send(this, 'messages:message', { message: 'Automatic notification from user: ' + username });

  return res.json({
    "decision": "notify",
    "notify_user": "{\"alertBody\":\"Un vendeur vient vers vous.\" }"
  });
});

module.exports = { path: '/', router: router };
