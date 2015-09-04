$(function() {
    var mapDiv = $('#map');
    var lat = mapDiv.attr('data-lat');
    var lng = mapDiv.attr('data-lng');
    var radius = mapDiv.attr('data-radius');
    var map = L.map('map').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tiles.mapbox.com/v4/fkruta.ljd3a238/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmtydXRhIiwiYSI6InZLQXp0LXMifQ.IzN6KCblMOhYUoTydg80ug', {
        attribution: '&copy; <a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        maxZoom: 20
    }).addTo(map);
    L.control.scale().addTo(map);
    var marker = L.marker([lat, lng]).addTo(map);
    var circle = L.circle([lat, lng], radius, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);
    marker.circle = circle;
});
/*
var map;
map = L.map('map');
var geo_search_ctl=new L.Control.GeoSearch({provider: new L.GeoSearch.Provider.Google()}).addTo(map);
geo_search_ctl._positionMarker = marker;
map.setView([48.862281, 2.6704076], 15);
var marker = L.marker([48.862281, 2.6704076]).addTo(map);
marker.dragging.enable();
var circle_l=L.circle(['48.862281', '2.6704076'], 100.0, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);
marker.circle=circle_l;
L.tileLayer('https://{s}.tiles.mapbox.com/v4/fkruta.ljd3a238/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmtydXRhIiwiYSI6InZLQXp0LXMifQ.IzN6KCblMOhYUoTydg80ug', {
    attribution: '&copy; <a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
    maxZoom: 20
}).addTo(map);
L.control.scale().addTo(map);
    */