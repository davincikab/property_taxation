var parcelData;
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
});

var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
}).addTo(map);;


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

function styleByClearance(feature) {
    let colors = ['#e41a1c','#377eb8','#4daf4a']
    let is_cleared = feature.properties ? feature.properties.is_cleared: feature;

    return !is_cleared ? colors[0] : colors[2];
}

var parcels = L.geoJSON(null, {
    style:function(feature){
        return {
            fillColor:styleByArrears(feature),
            weight:0.5,
            fillOpacity:0.7,
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
    parcelData = parcelsFeatures;

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
    'Legend<span>+</span></button>';

    // let legendContent = "";
    // let arrearValues = [500, 1000, 1500, 2000, 2500, 3000, 3500, 5000];
    // arrearValues.forEach((value, i) => {
    //     let color = styleByArrears(value);

    //     let text = value < 3500 ? "&lt; " + value : "&gt; "+ 3500;
    //     legendContent += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+text+" Ksh</span></div>";
    // });


    div.innerHTML += '<div class="collapse" id="collapseOne"></div>';

    return div;
}

legendControl.addTo(map);


// SEARCH OR FILTER
// Search 
var searchInput = document.getElementById("search-input");
var searchResult = document.getElementById("search-result");

searchInput.addEventListener("input", function(e) {
    let value = e.target.value;
    if(value.length >= 1) {
        filterParcels(value);
    } else {
        searchResult.innerHTML = "";
    }
});

function filterParcels(query) {
    // filter road matching the query
    let data = JSON.parse(JSON.stringify(parcelData));
    data.features = data.features.filter(feature => {
        let roadName = feature.properties.pk + ", " + feature.properties.owner ;
        if(roadName && roadName.toLowerCase().includes(query.toLowerCase()) ) {
            return feature;
        }
    });

    // create list item
    if(data.features.length > 6) {
        data.features = data.features.slice(0,6);
    }

    // sort data
    data.features = data.features.sort((a, b) => a.properties.plot_no - b.properties.plot_no);
    console.log(data);

    if(data.features.length > 0) {
        let docFragment = document.createDocumentFragment();

        data.features.forEach(feature => {
            let listItem = document.createElement("li");
            listItem.setAttribute("class", "list-group-item");
            listItem.setAttribute("id", feature.properties.pk);
            listItem.setAttribute("data-name", feature.properties.owner);

            listItem.innerHTML = "Plot " + feature.properties.pk +"<br><span>"+feature.properties.owner+"</span>";

            listItem.addEventListener("click", listEventListener);

            docFragment.append(listItem);
        });

        searchResult.innerHTML = "";
        searchResult.append(docFragment);
    } else {
        searchResult.innerHTML = "<p class='bg-light'>No result found</p>"
    }

}

function listEventListener(e) {
    let data = JSON.parse(JSON.stringify(parcelData));

    // get target attrinute;
    let target = e.target;
    let parcelNo = target.getAttribute("id");
    let name = target.getAttribute("data-name");

    // update search input value
    searchInput.value = name;
    searchResult.innerHTML = "";

    // zoom to road layer
    data.features = data.features.filter(feature => feature.properties.pk == parcelNo);
    console.log(data);

    // create a geojson with result
    let feature = L.geoJson(data, {
        style:function(feature) {
            return {
                color:"#c7f709",
                weight:4
            }
        },
        onEachFeature:onEachParcelFeature
    }).addTo(map);
    map.fitBounds(feature.getBounds());
}

// // layer control
var overlay = {
    "Parcels":parcels,
};

var baseLayer = {
    "Carto Light":cartoLight,
    "Carto Dark": cartoDark
};

L.control.layers(baseLayer, overlay, {collapsed:true}).addTo(map);


// Visualize by those cleared
var visualTypeControl = new L.Control({position:"topright"});
visualTypeControl.onAdd = function(map) {
    let div = L.DomUtil.create('div', 'visual-control');
    let visualType = ['Arrears', 'Clearance'];

    div.innerHTML += '<div class="form-check">'+
    '<input class="form-check-input position-static" type="radio" name="visual" value="arrear" aria-label="..." checked>'+
    '<label class="form-check-label">Arrear</label></div> <div class="form-check">'+
    '<input class="form-check-input position-static" type="radio" name="visual" id="blankRadio1" value="clearance" aria-label="...">'+
    '<label class="form-check-label">Clearance</label>'+
    '</div>';

    return div;
}

visualTypeControl.addTo(map);
addListener();

// event listener for visual type change
function addListener() {
    let radioVisual = document.querySelectorAll('.form-check-input');
    console.log(radioVisual);
    
    radioVisual.forEach(visual => {
        visual.addEventListener('click', function(e) {
            let value = e.target.value;
            changeVisual(value);
        });
    });
}

function changeVisual(value) {
    if(value == 'clearance') {
        parcels.eachLayer(layer => {
            layer.setStyle({
                fillColor:styleByClearance(layer.feature)
            });
        });

        legendClearance();
    } else {
        parcels.eachLayer(layer => {
            layer.setStyle({
                fillColor:styleByArrears(layer.feature)
            });
        });

        legendArrears();
    }
}

function legendArrears() {
    // get 
    let collapse = document.getElementById('collapseOne');
    let legendContent = "";
    let arrearValues = [500, 1000, 1500, 2000, 2500, 3000, 3500, 5000];
    arrearValues.forEach((value, i) => {
        let color = styleByArrears(value);

        let text = value < 3500 ? "&lt; " + value : "&gt; "+ 3500;
        legendContent += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+text+"</span></div>";
    });

    collapse.innerHTML = legendContent;

}

function legendClearance() {
    let collapse = document.getElementById('collapseOne');
    let values = [true, false];

    let legendContent = "";
    values.forEach(value => {
        let color = styleByClearance(value);

        let text = value ? "Cleared" : "Pending Clearance";
        legendContent += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+text+" Ksh</span></div>";
    });

    collapse.innerHTML = legendContent

}

legendArrears();


// listen to control 