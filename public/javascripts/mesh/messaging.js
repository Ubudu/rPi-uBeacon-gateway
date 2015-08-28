'use strict';

$(function() {
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
                if (logData.msg) {
                     event = '<span class="glyphicon glyphicon-log-in"></span> Received "' + logData.msg + '" from node ' + logData.dstAddr;
                }
                else {
                     event = '<span class="glyphicon glyphicon-log-in"></span> Received response from node ' + logData.dstAddr;
                }
                trClass = 'info';
                break;
            case 'mesh-remote-management-send':
                if (logData.cmdMode == 'get') {
                    event = '<span class="glyphicon glyphicon-send"></span> Sent GET ' + humanReadableProperties[logData.cmd] + ' to node ' + logData.dstAddr;
                } else {
                    event = '<span class="glyphicon glyphicon-send"></span> Sent SET ' + humanReadableProperties[logData.cmd] + ' to ' + logData.value + ' to node ' + logData.dstAddr;
                }
                trClass = 'info';
                break;
            case 'mesh-remote-management-response':
                event = '<span class="glyphicon glyphicon-log-in"></span> Received ' + humanReadableProperties[logData.cmd] + ' = ' + logData.value + ' from node ' + logData.srcAddr;
                trClass = 'success';
                break;
            case 'mesh-remote-management-receive':
                event = '<span class="glyphicon glyphicon-log-in"></span> Received remote management message about ' + humanReadableProperties[logData.cmd] + ' from node ' + logData.srcAddr;
                trClass = 'info';
                break;
            case 'button-pressed':
                if (logData.isPressed) {
                    event = '<span class="glyphicon glyphicon-import"></span> Pressed button on the beacon connected to the box';
                    trClass = 'default';
                } else {
                    event = '<span class="glyphicon glyphicon-export"></span> Released button on the beacon connected to the box';
                    trClass = 'default';
                }
                break;
            case 'connection':
                if (logData.connected) {
                    event = '<span class="glyphicon glyphicon-link"></span> A device connected to the beacon connected to the box';
                    trClass ='success';
                } else {
                    event = '<span class="glyphicon glyphicon-ban-circle"></span> A device disconnected from the beacon connected to the box';
                    trClass= 'warning';
                }
                break;
            default:
                break;
        }

        var row = $('<tr/>').addClass(trClass).append($('<td>').text(time).addClass('time')).append($('<td>').html(event).addClass('event')).append($('<td>').text(data).addClass('data'));

        logsContainer.prepend(row);
    };

    /* Generic messaging */
    var genericSwitchAddressFormatBtn = $('#mesh-send-generic-change-address-format');
    var genericAddressInput = $('#mesh-send-generic-address');
    var genericAddressHex = $('#mesh-send-generic-address-hex');
    var genericAddressNumeric = $('#mesh-send-generic-address-numeric');
    var genericAddressFormat = 'hex';
    genericAddressHex.on('click', function(event) {
        event.preventDefault();

        // Unset the 'Numeric' link
        genericAddressNumeric.parent().removeClass('active');
        genericAddressNumeric.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'Hex' link
        genericAddressHex.parent().addClass('active');
        genericAddressHex.find('span.glyphicon').addClass('glyphicon-ok');
        genericSwitchAddressFormatBtn.html('0x &nbsp;<span class="caret"></span>');

        // Convert field to hex if necessary
        if (genericAddressFormat !== 'hex') {
            var oldValue = genericAddressInput.val();
            if (oldValue) {
                var value = Number(oldValue).toString(16);
                genericAddressInput.val(value);
            }
            genericAddressFormat = 'hex';
        }
    });
    genericAddressNumeric.on('click', function(event) {
        event.preventDefault();

        // Unset the 'Hex' link
        genericAddressHex.parent().removeClass('active');
        genericAddressHex.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'Numeric' link
        genericAddressNumeric.parent().addClass('active');
        genericAddressNumeric.find('span.glyphicon').addClass('glyphicon-ok');
        genericSwitchAddressFormatBtn.html('Int &nbsp;<span class="caret"></span>');

        // Convert field to numeric if necessary
        if (genericAddressFormat !== 'numeric') {
            var oldValue = genericAddressInput.val();
            if (oldValue) {
                var value = parseInt(oldValue, 16);
                genericAddressInput.val(value);
            }
            genericAddressFormat = 'numeric';
        }
    });

    var genericMessagingForm = $('#mesh-send-generic-form');
    var genericMsgInput = $('#mesh-send-generic-message');
    genericMessagingForm.on('submit', function(event) {
        event.preventDefault();

        var rawDstAddr = genericAddressInput.val();
        var dstAddr = genericAddressFormat == 'hex' ? rawDstAddr : Number(rawDstAddr).toString(16);
        var msg = genericMsgInput.val();

        var formData = {
            dstAddr: dstAddr,
            msg: msg
        };
        var url = genericMessagingForm.attr('action');
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

    /* Remote management messaging */
    var managementSwitchCommandBtn = $('#mesh-send-management-change-command');
    var managementCommandInput = $('#mesh-send-management-command');
    var managementCommandGet = $('#mesh-send-management-command-get');
    var managementCommandSet = $('#mesh-send-management-command-set');
    var managementPropertySelect = $('#mesh-send-management-property');
    managementCommandGet.on('click', function(event) {
        event.preventDefault();

        // Unset the 'SET' link
        managementCommandSet.parent().removeClass('active');
        managementCommandSet.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'GET' link
        managementCommandGet.parent().addClass('active');
        managementCommandGet.find('span.glyphicon').addClass('glyphicon-ok');
        managementSwitchCommandBtn.html('GET &nbsp;<span class="caret"></span>');

        // Change the value of the hidden 'command' field
        managementCommandInput.val('get');

        // Enable all the properties
        managementPropertySelect.find('option').removeAttr('disabled');
    });
    managementCommandSet.on('click', function(event) {
        event.preventDefault();

        // Unset the 'GET' link
        managementCommandGet.parent().removeClass('active');
        managementCommandGet.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'SET' link
        managementCommandSet.parent().addClass('active');
        managementCommandSet.find('span.glyphicon').addClass('glyphicon-ok');
        managementSwitchCommandBtn.html('SET &nbsp;<span class="caret"></span>');

        // Change the value of the hidden 'command' field
        managementCommandInput.val('set');

        // Disable all the properties that can't be set
        managementPropertySelect.find('option[data-lock=1]').attr('disabled', true).removeAttr('selected');
    });

    var managementSwitchAddressFormatBtn = $('#mesh-send-management-change-address-format');
    var managementAddressInput = $('#mesh-send-management-address');
    var managementAddressHex = $('#mesh-send-management-address-hex');
    var managementAddressNumeric = $('#mesh-send-management-address-numeric');
    var managementAddressFormat = 'hex';
    managementAddressHex.on('click', function(event) {
        event.preventDefault();

        // Unset the 'Numeric' link
        managementAddressNumeric.parent().removeClass('active');
        managementAddressNumeric.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'Hex' link
        managementAddressHex.parent().addClass('active');
        managementAddressHex.find('span.glyphicon').addClass('glyphicon-ok');
        managementSwitchAddressFormatBtn.html('0x &nbsp;<span class="caret"></span>');

        // Convert field to hex if necessary
        if (managementAddressFormat !== 'hex') {
            var oldValue = managementAddressInput.val();
            if (oldValue) {
                var value = Number(oldValue).toString(16);
                managementAddressInput.val(value);
            }
            managementAddressFormat = 'hex';
        }
    });
    managementAddressNumeric.on('click', function(event) {
        event.preventDefault();

        // Unset the 'Hex' link
        managementAddressHex.parent().removeClass('active');
        managementAddressHex.find('span.glyphicon').removeClass('glyphicon-ok');

        // Set the 'Numeric' link
        managementAddressNumeric.parent().addClass('active');
        managementAddressNumeric.find('span.glyphicon').addClass('glyphicon-ok');
        managementSwitchAddressFormatBtn.html('Int &nbsp;<span class="caret"></span>');

        // Convert field to numeric if necessary
        if (managementAddressFormat !== 'numeric') {
            var oldValue = managementAddressInput.val();
            if (oldValue) {
                var value = parseInt(oldValue, 16);
                managementAddressInput.val(value);
            }
            managementAddressFormat = 'numeric';
        }
    });

    var managementMessagingForm = $('#mesh-send-management-form');
    var managementValueInput = $('#mesh-send-management-value');

    managementMessagingForm.on('submit', function(event) {
        event.preventDefault();

        var rawDstAddr = managementAddressInput.val();
        var dstAddr = managementAddressFormat == 'hex' ? rawDstAddr : Number(rawDstAddr).toString(16);
        var cmdMode = managementCommandInput.val();
        var cmd = managementPropertySelect.val();
        var value = managementValueInput.val();

        var formData = {
            dstAddr:  dstAddr,
            cmdMode: cmdMode,
            cmd: cmd,
            value: value
        };
        var url = managementMessagingForm.attr('action');
        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            dataType: 'json',
            success: function(data) {
                data.eventType = 'mesh-remote-management-send';
                prependToLog(data);
            }
        });
    });

    var clearLogsBtn = $('#mesh-logs-clear');
    clearLogsBtn.on('click', function(event) {
        event.preventDefault();
        logsContainer.empty();
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
    UBU.socket.on('ubeacon:remote-management-message', function(data) {
        if (data.rawResponse.indexOf('0d0a', this.length - 4) !== -1) {
            // We're on the beacon receiving the remote management message
            data.eventType = 'mesh-remote-management-receive';
        } else {
            // We're on the beacon which initiated the remote management message and this is the response
            data.eventType = 'mesh-remote-management-response';
        }
        prependToLog(data);
    });
});

var humanReadableProperties = {
    'mac_address': 'MAC address',
    'serial_number': 'serial number',
    'battery_level': 'battery level',
    'tx_power': 'TX power',
    'advertising_state': 'advertising state',
    'proximity_uuid': 'proximity UUID',
    'major': 'Major',
    'minor': 'Minor',
    'led_state': 'LED state',
    'rtc_time': 'RTC time'
};