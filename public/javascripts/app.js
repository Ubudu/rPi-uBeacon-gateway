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
});