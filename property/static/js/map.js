var map = L.map("map", {
    center:[-0.24776292115994655, 41.7309182882309],
    zoom:15,
    // minZoom:15,
    zoomControl:false
});

L.control.zoom({
    position:'bottomright'
}).addTo(map);

// add a tile Layer
var cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
}).addTo(map);

var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
});

var parcels = L.geoJSON(null, {
    style:function(feature){

    },
    onEachFeature:function(feature, layer) {

    }
});

parcels.addTo(map);

fetch("/static/parcel.geojson")
.then(response => response.json())
.then(parcelsData => {
    parcels.addData(parcelsData);
    map.fitBounds(parcels.getBounds()); 
})
.catch(error => {
    console.error(error)
});
