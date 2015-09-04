'use strict';

var uuid = require('node-uuid');

module.exports= {
    uuid: function(text) {
        return uuid.unparse(uuid.parse(text));
    },
    secondsToHoursMinutes: function(seconds) {
        var hours = Math.floor(seconds/3600);
        var minutes = Math.floor(seconds - hours * 3600);
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return hours + ':' + minutes;
    }
};
