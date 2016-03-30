'use strict';

var io = require('socket.io')();
var observer = require('node-observer');
var debug = require('debug')('socket');

// TODO Attach handlers...

io.on('connection', function(socket) {
  debug('connection');

  observer.send(this, 'socket:connection');

  observer.subscribe(socket, 'ubeacon:connection', function(ubeacon, data) {
    socket.emit('ubeacon:connection', data);
  });

  observer.subscribe(socket, 'ubeacon:button', function(ubeacon, data) {
    socket.emit('ubeacon:button', data);
  });

  observer.subscribe(socket, 'ubeacon:ack', function(ubeacon, data) {
    socket.emit('ubeacon:ack', data);
  });

  observer.subscribe(socket, 'ubeacon:message', function(ubeacon, data) {
    socket.emit('ubeacon:message', data);
  });

  observer.subscribe(socket, 'ubeacon:remote-management-message', function(ubeacon, data) {
    socket.emit('ubeacon:remote-management-message', data);
  });

  observer.subscribe(socket, 'messages:message', function(router, data) {
    socket.emit('messages:message', data);
  });
});

module.exports = io;