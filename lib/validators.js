/*jslint node: true */
'use strict';

/*
 *
 */
module.exports = {


    /**
     *
     */
    isValidUUID: function(val) {
        var filtered = val.toLowerCase().replace(/[^0-9a-f]/ig,'');
        if (filtered.length !== 32) {
            throw new Error('%s is not valid UUID');
        }
        return filtered;
    },

    /**
     *
     */
    isInRange: function(val, min, max) {
        var intVal = parseInt(val);
        if (intVal == null || intVal < min || intVal > max) {
            throw new Error('%s has to be a number in <' + min + ', ' + max + '> range'); // eslint-disable-line
        }
        return intVal;
    },

    /**
     *
     */
    isUint16: function(val) {
        var min = 0x0000;
        var max = 0xffff;
        return this.isInRange(val, min, max);
    },

    /**
     * Checks if value is a multiple of 10 and is in range
     */
    isValidMutipleOfTen: function(val, min, max) {
        var intVal = parseInt(val);
        if (intVal%10 !== 0) {
            throw new Error('%s is not multiple of 10');
        }

        return this.isInRange(val, min, max);
    }
};
