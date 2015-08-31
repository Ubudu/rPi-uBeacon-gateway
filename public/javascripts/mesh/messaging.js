'use strict';

var logsContainer = $('#mesh-logs-container');

$(function() {

    var targetNodeInput = $('#mesh-target-node');

    var getDstAddrAsHex = function() {
        return Number(targetNodeInput.val()).toString(16);
    };

    // Generic messaging
    var genericMessageInput = $('#mesh-generic-message');
    var genericMessageSendBtn = $('#mesh-generic-send');
    genericMessageSendBtn.on('click', function(event) {
        event.preventDefault();

        var dstAddr = getDstAddrAsHex();
        var msg = genericMessageInput.val();

        sendGenericMessage(dstAddr, msg);
    });

    // Remote management shortcuts UI
    var managementShortcutGreenLedBtns = $('#shortcut-led-green button');
    var managementShortcutAdvertisementBtns = $('#shortcut-advertising button');
    var managementShortcutBatteryLevelBtn = $('button#shortcut-battery');

    // Handle green led state toggling
    managementShortcutGreenLedBtns.on('click', function(event) {
        event.preventDefault();

        // split id 'shortuct-led-green-on' by '-' and get 'on' or 'off'
        var setOn = $(this).attr('id').split('-').pop() == 'on';

        var dstAddr = getDstAddrAsHex();
        var cmdMode = 'set';
        var cmd = 'led_state';
        var value = setOn ? 0x02 : 0x00;

        sendMeshRemoteManagement(dstAddr, cmdMode, cmd, value);
    });

    // Handle advertisements state toggle
    managementShortcutAdvertisementBtns.on('click', function(event) {
        event.preventDefault();

        // split id 'shortcut-advertising-on' by '-' and get 'on' or 'off'
        var setOn = $(this).attr('id').split('-').pop() == 'on';

        var dstAddr = getDstAddrAsHex();
        var cmdMode = 'set';
        var cmd = 'advertising_state';
        var value = setOn ? 0x01 : 0x00;

        sendMeshRemoteManagement(dstAddr, cmdMode, cmd, value);
    });

    // Handle getting battery level
    managementShortcutBatteryLevelBtn.on('click', function(event) {
        event.preventDefault();

        var dstAddr = getDstAddrAsHex();
        var cmdMode = 'get';
        var cmd = 'battery_level';
        var value = null;

        sendMeshRemoteManagement(dstAddr, cmdMode, cmd, value);
    });

    /* Remote management advanced UI */
    var managementCommandGroup = $('#mesh-command-group');
    var managementCommandBtns = managementCommandGroup.find('ul.dropdown-menu > li > a');
    var managementSwitchCommandBtn = managementCommandGroup.find('button.dropdown-toggle');
    var managementCommandInput = $('#mesh-command');
    var managementPropertySelect = $('#mesh-property');
    var managementValueInput = $('#mesh-value');
    var managementSendBtn = $('#mesh-management-send');

    // Handle command toggle
    managementCommandBtns.on('click', function(event) {
        event.preventDefault();

        // split id 'mesh-command-get' by '-' and get 'get' or 'set';
        var cmdMode = $(this).attr('id').split('-').pop();

        managementCommandInput.val(cmdMode);

        if (cmdMode == 'get') {
            // Change the label of the button
            managementSwitchCommandBtn.html('GET &nbsp;<span class="caret"></span>');

            // Enable all the properties
            managementPropertySelect.find('option').removeAttr('disabled');
        } else {
            // Change the label of the button
            managementSwitchCommandBtn.html('SET &nbsp;<span class="caret"></span>');

            // Disable non-modifiable properties
            managementPropertySelect.find('option[data-lock=1]').attr('disabled', true).removeAttr('selected');
        }
    });

    managementSendBtn.on('click', function(event) {
        event.preventDefault();

        var dstAddr = getDstAddrAsHex();
        var cmdMode = managementCommandInput.val();
        var cmd = managementPropertySelect.val();
        var value = managementValueInput.val();

        sendMeshRemoteManagement(dstAddr, cmdMode, cmd, value );
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

/**
 * 
 */
function sendMeshRemoteManagement(dstAddr, cmdMode, cmd, value) {
    var formData = {
        dstAddr:  dstAddr,
        cmdMode: cmdMode,
        cmd: cmd,
        value: value
    };
    $.ajax({
        type: 'POST',
        url: '/mesh-network/remote-management-messages',
        data: formData,
        dataType: 'json',
        success: function(data) {
            data.eventType = 'mesh-remote-management-send';
            prependToLog(data);
        }
    });   
}

/**
 * Use the remote webservice to send a generic message to node {dstAddr}
 *
 * @param dstAddr   Id of the target node (in hex)
 * @param msg       Message to send
 */
function sendGenericMessage(dstAddr, msg) {
    var formData = {
        dstAddr: dstAddr,
        msg: msg
    };
    $.ajax({
        type: 'POST',
        url: '/mesh-network/generic-messages',
        data: formData,
        dataType: 'json',
        success: function(data) {
            data.eventType = 'mesh-send';
            prependToLog(data);
        }
    });
}

/**
 *
 */
var prependToLog = function(logData) {

    var time = moment(new Date(logData.timestamp)).format('YYYY-MM-DD HH:mm:ss');
    var event = 'Event type unknown';
    var data = JSON.stringify(logData);

    var alertClass = 'info';

    switch (logData.eventType) {
        case 'mesh-send':
            event = '<span class="glyphicon glyphicon-send"></span> Sent "' + logData.msg + '" to node ' + logData.dstAddr;
            break;
        case 'mesh-ack':
            if (logData.status == 1) {
                event = '<span class="glyphicon glyphicon-ok-circle"></span> Received ACK-SUCCESS from node ' + logData.dstAddr;
                alertClass = 'success';
            } else {
                event = '<span class="glyphicon glyphicon-remove-circle"></span> Received ACK-FAILED from node ' + logData.dstAddr;
                alertClass = 'warning';
            }
            break;
        case 'mesh-receive':
            if (logData.msg) {
                event = '<span class="glyphicon glyphicon-log-in"></span> Received "' + logData.msg + '" from node ' + logData.dstAddr;
            }
            else {
                event = '<span class="glyphicon glyphicon-log-in"></span> Received response from node ' + logData.dstAddr;
            }
            break;
        case 'mesh-remote-management-send':
            if (logData.cmdMode == 'get') {
                event = '<span class="glyphicon glyphicon-send"></span> Sent GET ' + humanReadableProperties[logData.cmd] + ' to node ' + logData.dstAddr;
            } else {
                event = '<span class="glyphicon glyphicon-send"></span> Sent SET ' + humanReadableProperties[logData.cmd] + ' to ' + logData.value + ' to node ' + logData.dstAddr;
            }
            break;
        case 'mesh-remote-management-response':
            event = '<span class="glyphicon glyphicon-log-in"></span> Received ' + humanReadableProperties[logData.cmd] + ' = ' + logData.value + ' from node ' + logData.srcAddr;
            alertClass = 'success';
            break;
        case 'mesh-remote-management-receive':
            event = '<span class="glyphicon glyphicon-log-in"></span> Received remote management message about ' + humanReadableProperties[logData.cmd] + ' from node ' + logData.srcAddr;
            break;
        case 'button-pressed':
            if (logData.isPressed) {
                event = '<span class="glyphicon glyphicon-import"></span> Pressed button on the beacon connected to the box';
            } else {
                event = '<span class="glyphicon glyphicon-export"></span> Released button on the beacon connected to the box';
            }
            alertClass = 'default';
            break;
        case 'connection':
            if (logData.connected) {
                event = '<span class="glyphicon glyphicon-link"></span> A device connected to the beacon connected to the box';
                alertClass ='success';
            } else {
                event = '<span class="glyphicon glyphicon-ban-circle"></span> A device disconnected from the beacon connected to the box';
                alertClass = 'warning';
            }
            break;
        default:
            event = '<span class="glyphicon glyphicon-question-sign"></span> Event unknown';
            alertClass = 'default';
            break;
    }

    var alertId = 'alert-' + Math.floor(10000 * Math.random());

    var alertTitle = $('<a role="button" data-toggle="collapse" href="#' + alertId + '" aria-expanded=false aria-controls="' + alertId + '">')
        .append($('<strong>').text(time).addClass('time'))
        .append($('<span>').html(event).addClass('event'));

    var alertBody = $('<div class="alert-body collapse" id="' + alertId + '">')
        .append($('<pre class="prettyprint lang-js">').text(JSON.stringify(logData, null, 4)));

    var alert = $('<div class="alert alert-' + alertClass + '">')
        .append(alertTitle)
        .append(alertBody);

    logsContainer.prepend(alert);

    prettyPrint();
};
