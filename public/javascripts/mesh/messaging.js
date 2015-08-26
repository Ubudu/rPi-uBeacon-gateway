'use strict';

$(function() {
    var form = $('#mesh-send-form');
    var dstAddrInput = $('#mesh-send-address');
    var msgInput = $('#mesh-send-message');

    var logsContainer = $('#mesh-logs-container');

    var prependToLog = function(logData) {
        var time = moment(new Date(logData.timestamp)).format('YYYY-MM-DD HH:mm:ss');
        var event = 'Event type unknown';
        var data = JSON.stringify(logData);
        var trClass = '';

        switch (logData.eventType) {
            case 'mesh-send':
                event = '<span class="glyphicon glyphicon-send"></span> Sent "' + logData.msg + '" to node ' + logData.dstAddr;
                trClass = 'info';
                break;
            case 'mesh-ack':
                if (logData.status == 1) {
                    event = '<span class="glyphicon glyphicon-ok-circle"></span> Received ACK-SUCCESS from node ' + logData.dstAddr;
                    trClass = 'success';
                } else {
                    event = '<span class="glyphicon glyphicon-remove-circle"></span> Received ACK-FAILED from node ' + logData.dstAddr;
                    trClass = 'warning';
                }
                break;
            case 'mesh-receive':
                event = '<span class="glyphicon glyphicon-log-in"></span> Received "' + logData.msg + '" from node ' + logData.dstAddr;
                trClass = 'success';
                break;
            case 'button-pressed':
                if (logData.isPressed) {
                    event = '<span class="glyphicon glyphicon-import"></span> Pressed button on the beacon connected to the box';
                    trClass = 'info';
                } else {
                    event = '<span class="glyphicon glyphicon-export"></span> Released button on the beacon connected to the box';
                    trClass = 'info';
                }
                break;
            case 'connection':
                if (logData.connected) {
                    event = '<span class="glyphicon glyphicon-link"></span> A device connected to the beacon connected to the box';
                    trClass ='success';
                } else {
                    event = '<span class="glyphicon glyphicon-ban-circle"></span> A device disconnected from the beacon connected to the box';
                    trClass= 'info';
                }
                break;
            default:
                break;
        }

        var row = $('<tr/>').addClass(trClass).append($('<td>').text(time).addClass('time')).append($('<td>').html(event).addClass('event')).append($('<td>').text(data).addClass('data'));

        logsContainer.prepend(row);
    };

    form.on('submit', function(event) {
        event.preventDefault();
        var formData = {
            dstAddr: parseInt(dstAddrInput.val()),
            msg: msgInput.val()
        };
        var url = form.attr('action');
        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            dataType: 'json',
            success: function(data) {
                data.eventType = 'mesh-send';
                prependToLog(data);
            }
        });
    });

    UBU.socket.on('ubeacon:ack', function(data) {
        data.eventType = 'mesh-ack';
        prependToLog(data);
    });
    UBU.socket.on('ubeacon:message', function(data) {
        console.log('received');
        data.eventType = 'mesh-receive';
        prependToLog(data);
    });
    UBU.socket.on('ubeacon:button', function(data) {
        data.eventType = 'button-pressed';
        prependToLog(data);
    });
    UBU.socket.on('ubeacon:connection', function(data) {
        data.eventType = 'connection';
        prependToLog(data);
    });

});