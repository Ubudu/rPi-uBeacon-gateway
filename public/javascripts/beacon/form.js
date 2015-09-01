'use strict';

$(function() {
  // Toggle the section with the mesh window settings depending when enabled or not
  var meshWindowSettingsSection = $('#mesh_window_settings');
  $('input[name="meshSettings[enable_mesh_window]"]').change(function() {
    var value = $(this).val();
    if (value == 1) {
      meshWindowSettingsSection.slideDown();
    } else {
      meshWindowSettingsSection.slideUp();
    }
  });
});