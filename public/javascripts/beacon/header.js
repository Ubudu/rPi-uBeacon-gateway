'use strict';

$(function() {
    var beaconStatusIndicator = $('#beacon-status');

    var updateStatus = function() {
        $.ajax({
            type: 'GET',
            url: '/status',
            dataType: 'json',
            success: function(data) {
                if (data.ubeacon.connected) {
                    console.log('connected');
                    beaconStatusIndicator
                        .removeClass('glyphicon-refresh')
                        .removeClass('spin')
                        .removeClass('text-warning')
                        .addClass('glyphicon-ok-circle');
                } else {
                    console.log('disconnected');
                    beaconStatusIndicator
                        .removeClass('glyphicon-ok-circle')
                        .removeClass('spin')
                        .addClass('glyphicon-remove-circle')
                        .addClass('text-warning');
                }
            }
        });
    };

    setInterval(updateStatus, 5000);
    updateStatus();
});