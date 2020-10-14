var map = L.map("map", {
    center:[-0.24776292115994655, 41.7309182882309],
    zoom:15,
    // minZoom:15,
    zoomControl:false
});

// change zoom location
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
        "<p class='popup-item'>Arrear<b>Ksh. "+ feature.properties.arrears +"</b></p>"+
    "</div>"+
    "</div>";

    layer.bindPopup(popupContent);

    layer.on("mouseover", function(e){

    });

    layer.on("mouseout", function(e) {

    });
}


function styleByArrears(feature) {
    let colors =  ["#fcde9c", "#faa476", "#f0746e", "#e34f6f", "#dc3977", "#b9257a", "#7c1d6f"];
    let arrear = feature.properties ? feature.properties.arrears: feature;

    return arrear <= 500 ? colors[0] : arrear <= 1000 ? colors[1] : arrear <= 1500 ? colors[2] : arrear <= 2000 ? colors[3] 
        : arrear <= 2500 ? colors[4] : arrear <= 3000 ? colors[5] : colors[6];
}

var parcels = L.geoJSON(null, {
    style:function(feature){
        return {
            fillColor:styleByArrears(feature),
            weight:0.5,
            fillOpacity:0.8,
            color:"#fff"
        }
        
    },
    onEachFeature:onEachParcelFeature
});

parcels.addTo(map);

fetch("/parcels/")
.then(response => response.json())
.then(parcelsData => {
    let parcelInfo = JSON.parse(parcelsData[0]);
    let parcelsFeatures = JSON.parse(parcelsData[1]);

    console.log(parcelsFeatures);
    parcelsFeatures.features.forEach(feature => {
        let info = parcelInfo.find(pinfo => pinfo.pk == feature.properties.pk);
        if(info) {
            feature.properties = {...feature.properties, ...info.fields}
        }

        return feature
    });

    console.log(parcelsFeatures);

    parcels.addData(parcelsFeatures);
    map.fitBounds(parcels.getBounds()); 
})
.catch(error => {
    console.error(error)
});


// legend control
var legendControl = new L.Control({position:"bottomleft"});
legendControl.onAdd = function(map) {
    let div = L.DomUtil.create("div", "accordion bg-white");

    div.innerHTML = '<button class="btn btn-block bg-light text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">'+
    'Legend</button>';

    let legendContent = "";
    let arrearValues = [500, 1000, 1500, 2000, 2500, 3000, 3500, 5000];
    arrearValues.forEach((value, i) => {
        let color = styleByArrears(value);

        let text = value < 3500 ? "&lt; " + value : "&gt; "+ 3500;
        legendContent += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+text+" Ksh</span></div>";
    });


    div.innerHTML += '<div class="collapse" id="collapseOne">'+legendContent+'</div>';

    return div;
}

legendControl.addTo(map);