'use strict';

var uuid = require('node-uuid');

module.exports= {
    uuid: function(text) {
        return uuid.unparse(uuid.parse(text));
    }
};
