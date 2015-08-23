var express = require('express');
var router = new express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/configure-my-beacon', function(req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = { path: '/', router: router };
