'use strict';

// App namespace
window.UBU = {};

Inputmask.extendDefinitions({
  'h': {
    validator: '[a-fA-F0-9]',
    cardinality: 1,
    prevalidator: null
  }
});

$(function() {
  // Apply mask to inputs
  $('[data-inputmask]').inputmask();

  UBU.socket = io.connect();

  UBU.socket.on('ubeacon:message', function(data) {
    var message = data.msg;
    if (message!= null && message.startsWith('H|')) {
      var tmp = message.split('|');
      var clientName = tmp[1];

      $.amaran({
        'message'   : 'Customer ' + clientName + ' is requesting your attention.',
        'position'  : 'bottom left',
        'inEffect'  : 'slideLeft',
        'sticky'    : true,
        'delay'     : 10000
      });
    }
  });
});