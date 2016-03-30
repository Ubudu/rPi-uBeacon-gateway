'use strict';

$(function() {
  var messagesContainer = $('#messages-logs-container');

  var clearLogsBtn = $('#messages-logs-clear');
  clearLogsBtn.on('click', function(event) {
    event.preventDefault();
    messagesContainer.empty();
  });

  UBU.socket.on('messages:message', function(data) {
    var time = '<span class="message-time">' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + '</span>';
    var prefix = '<span class="glyphicon glyphicon-log-in"></span>';
    var message = '<span class="message-content">' + data.message + '</span>';

    var alert = $('<div class="alert alert-success">')
        .append(prefix)
        .append(message)
        .append(time);

    messagesContainer.prepend(alert);
  });
});