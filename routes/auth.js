'use strict';

var express = require('express');
var fs = require('fs');
var request = require('request');
var router = new express.Router();

var credentialsPath = __dirname + '/../credentials.json';

/* Set the correct header section */
router.use(function(req, res, next) {
  res.locals.headerSection = 'authentication';
  next();
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('auth/login');
});

/* Handle login form */
router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var token = req.body.token;

  if (!(email && password) && !token) {
    var err = 'Some credentials are missing.';
    return res.render('auth/login', { err: err, email: email, token: token });
  }

  if (token) {
    // We save the token in a credentials.json file
    var credentials = { token: token };
    fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 4), function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/venue-infos');
    });
  } else {
    // We need to post email & password to server to retrieve an OAuth token
    var options = {
      uri: 'https://manager.ubudu.com/management_app/access_token.json',
      method: 'POST',
      json: {
        user: { email: email, password: password }
      }
    };
    request(options, function(err, response, body) {
      var credentials = { token: body.token };
      fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 4), function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/venue-infos');
      });
    });
  }

  //return res.render('auth/login');
});

router.get('/logout', function(req, res, next) {
  // Delete the 'credentials.json' file if it exists
  fs.exists(credentialsPath, function(exists) {
    if (exists) {
      fs.unlink(credentialsPath, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    } else {
      return res.redirect('/');
    }
  });
});

module.exports = { path: '/', router: router };
