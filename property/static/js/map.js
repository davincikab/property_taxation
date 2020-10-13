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


function onEachParcelFeature(feature, layer) {
    let popupContent = "<div class='popup-content'>"+
    "<h5 class='popup-title'>Plot Number "+ feature.properties.pk +"</h5>"+
    "<div class='popup-body'>"+
        "<p class='popup-item'>Owner<b>"+ feature.properties.owner +"</b></p>"+
        "<p class='popup-item'>Arrear<b>"+ feature.properties.contructi +"</b></p>"+
    "</div>"+
    "</div>";

    layer.bindPopup(popupContent);

    layer.on("mouseover", function(e){

    });

    layer.on("mouseout", function(e) {

    });
}

var parcels = L.geoJSON(null, {
    style:function(feature){

    },
    onEachFeature:onEachParcelFeature
});

parcels.addTo(map);

fetch("/parcels/")
.then(response => response.json())
.then(parcelsData => {
    console.log(parcelsData);
    parcels.addData(parcelsData);
    map.fitBounds(parcels.getBounds()); 
})
.catch(error => {
    console.error(error)
});
