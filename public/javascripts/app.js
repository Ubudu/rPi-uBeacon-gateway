'use strict';

Inputmask.extendDefinitions({
    'h': {
        validator: '[a-fA-F0-9]',
        cardinality: 1,
        prevalidator: null
    }
});

$(function() {
    // Apply mask to inputs
    $(':input').inputmask();
});