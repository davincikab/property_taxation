var closeFilterButton = document.getElementById("btn-close");
var filterSection = document.getElementById("filter-section");
var materialSelect = document.getElementById("material-select");
var contractorSelect = document.getElementById("contractor-select");
var surfaceSelect = document.getElementById("surface-select");
var searchInput = document.getElementById("search-input");
var searchResult = document.getElementById("search-result");

var roadsData;
var contractors;
var materials;
var structure;
var surface;


var map = L.map("map", {
    center:{lat: 0.5188716059672112, lng: 35.27007222175599},
    zoom:15,
    minZoom:10
});


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

// 
function getRoadColor(visual, feature) {
    let colorsOne = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#313695'];
    let colorsTwo = ['#d53e4f','#fc8d59','#fee08b','#ffffbf','#e6f598','#99d594','#3288bd']

    if (visual == "material") {
        let value = feature.properties.material;
        let index = materials.indexOf(value);

        return materials.length <= 7 ? colorsTwo[index] : colorsOne[index];
    } else if (visual == "contractor") {
        let value = feature.properties.contractor;
        let index = contractors.indexOf(value);
        
        return contractors.length <= 7 ? colorsTwo[index] : colorsOne[index];

    } else if (visual == "structure") {
        let value = feature.properties.road_struc;
        let index = structure.indexOf(value);
        
        return structure.length <= 7 ? colorsTwo[index] : colorsOne[index];

    } else if (visual == "surface") {
        let value = feature.properties.surface;
        let index = surface.indexOf(value);
        
        return surface <= 7 ? colorsTwo[index] : colorsOne[index];
    } else {
        return "#ff002e";
    }

}

// roads layer
var roads = L.geoJson(null, {
    style:function(feature) {
        return {
            color:"#ff002e",
            weight:2,
        }
    },
    onEachFeature:onEachRoadFeature
});

function onEachRoadFeature(feature, layer) {
    let popupContent = "<div class='popup-content'>"+
    "<h5 class='popup-title'>"+ feature.properties.name +"</h5>"+
    "<div class='popup-body'>"+
        "<p class='popup-item'>Surface<b>"+ feature.properties.surface +"</b></p>"+
        "<p class='popup-item'>Contruction<b>"+ feature.properties.contructi +"</b></p>"+
        "<p class='popup-item'>Authority<b>"+ feature.properties.authority +"</b></p>"+
        "<p class='popup-item'>Material<b>"+ feature.properties.material +"</b></p>"+
        "<p class='popup-item'>Contractor<b>"+ feature.properties.contractor +"</b></p>"+
    "</div>"+
    "</div>";
    layer.bindPopup(popupContent);

    layer.on("mouseover", function(e){

    });

    layer.on("mouseout", function(e) {

    });
}

roads.addTo(map);

// ward layer
var wards = L.geoJson(null, {
    style:function() {
        return {
            fillColor:"#fc8d59",
            color:"#c9c122",
            weight:0.5
        }
    },
    onEachFeature:onEachWardFeature
});

function onEachWardFeature(feature, layer) {
    let popupContent = "<div class='popup-content'>"+
    "<h5 class='popup-title'>"+ feature.properties.elec_area_field +"</h5>"+
    "<div class='popup-body'>"+
        "<p class='popup-item'>Local Authority<b>"+ feature.properties.local_auth +"</b></p>"+
        "<p class='popup-item'>Contituency<b>"+ feature.properties.const_nam +"</b></p>"+
    "</div>"+
    "</div>";
    layer.bindPopup(popupContent);
}

// municipality area
var municipality = L.geoJson(null, {
    style:{
        fillColor:"#91cf60",
        fillOpacity:0.6,
        color:"#E9E9E9",
        weight:1
    },
    onEachFeature:function(feature, layer) {
        let popupContent = "<div class='popup-content'>"+
        "<h5 class='popup-title'>Municipality</h5>"+
        "<div class='popup-body'>"+
            "<p class='popup-item'>Eldoret Municipality</p>"+
        "</div>"
        "</div>";
        layer.bindPopup(popupContent);
    }
});

// load the data
let requests = [fetch("/roads"), fetch("/other_data")];
let dataLoad = Promise.all(requests);

fetch("/roads")
.then(response => {
    console.log(response);

    return response.json()
}).then(road => {
    // add year column
    road.features.forEach(feature => {
        if(feature.properties.constructi) {
            feature.properties.year = feature.properties.constructi.split(",")[1]
        }
        
        return feature;
    });

    roadsData = road;

    console.log(road);
    roads.addData(road);

    materials = getUniqueValues(road, "material");
    surface = getUniqueValues(road, "surface");
    structure = getUniqueValues(road, "road_struc");
    contractors = getUniqueValues(road, "contractor");

    updateSelectElement(materials, materialSelect);
    updateSelectElement(surface, surfaceSelect);
    updateSelectElement(contractors, contractorSelect);
})
.catch(error => {
    console.log(error);
});


fetch("/other_data")
.then(response => {
    console.log(response);

    return response.json()
}).then(other_data => {
    console.log();

    wards.addData(JSON.parse(other_data[0]));
    municipality.addData(JSON.parse(other_data[1]));
})
.catch(error => {
    console.log(error);
});

// get uniques values
function getUniqueValues(data, field) {
    let newData = data.features.map(feature => feature.properties[field]);
    newData = [...new Set(newData)];

    return newData;
}

function updateSelectElement(data, element) {
    element.innerHTML = "";
    element.innerHTML += "<option value='all'>All ...</option>";

    data.forEach(entry => {
        element.innerHTML += "<option value='"+ entry +"'>"+ entry +"</option>";
    });
}

// layer control
var overlay = {
    "Roads":roads,
    "Ward" :wards,
    "Municipility":municipality
};

var baseLayer = {
    "Carto Light":cartoLight,
    "Carto Dark": cartoDark
};

L.control.layers(baseLayer, overlay, {collapsed:true}).addTo(map);


// Event listeners
map.on("overlayadd", function(e) {
    roads.bringToFront();
});

map.on("layeradd", function(e) {
    if(roads) {
        roads.bringToFront();
    } 
   
});

map.on("overlayremove", function(e) {
    roads.bringToFront();
});

// ========================= Visual type =============================
// Visual Legend
var legendControl = new L.Control({position:"bottomright"});
legendControl.onAdd = function(map) {
    let div = L.DomUtil.create("div", "accordion bg-white");

    div.innerHTML = '<button class="btn btn-block bg-light text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">'+
    'Legend</button>';

   div.innerHTML += '<div class="collapse" id="collapseOne"></div>';

    return div;
}

legendControl.addTo(map);

var visualType = document.querySelectorAll(".form-group .form-check");
visualType.forEach(visual => {
    visual.addEventListener("change", function(e) {
        // get the value
        let value = e.target.value;
        updateVisual(value);
    });
});


function updateVisual(value) {
    roads.eachLayer(layer => {
        let feature = layer.feature;
        layer.setStyle({
            color:getRoadColor(value, feature),
            weight:3
        });
    });

    if(value != "default") {
        updateLegend(value);
        if(!map.hasLayer(cartoDark)) {
            cartoDark.addTo(map);
            map.removeLayer(cartoLight);
        }
    } else {
        let legendContainer = document.getElementById("collapseOne");

        legendContainer.innerHTML = "";
    }
}

// update the legend with the corresponding visual type
function updateLegend(value) {
    let legendContainer = document.getElementById("collapseOne");
   
    // create a color scale
    let legendContent = "";
    let feature = roads.toGeoJSON().features[0];

    if(value == "material") {
        legendContent = getLegendContent(materials, feature, "material", value);
    } else if (value == "contractor") {
        legendContent = getLegendContent(contractors, feature, "contractor", value);
    } else if (value == "surface") {
        legendContent = getLegendContent(surface, feature, "surface", value);
    } else if (value == "structure") {
        legendContent = getLegendContent(structure, feature, "road_struc", value);
    } 


    legendContainer.innerHTML = legendContent;
}

// legend colors
function getLegendContent(data, feature, field, value) {
    let legendContent = "";
    data.forEach(element => {
        feature.properties[field] = element;
        let color = getRoadColor(value, feature);

        legendContent += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+element+"</span></div>";
    });

    return legendContent;
}

// Filter Section
var filterControl = new L.Control({position:"topleft"});

filterControl.onAdd = function(map) {
    let div = L.DomUtil.create("div", "leaflet-touch leaflet-bar");

    div.innerHTML = "<a><i class='fa fa-filter'></i></a>";

    div.addEventListener("click", function(e) {
        filterSection.classList.toggle("collapse-filter");
        map.removeControl(filterControl);
    });

    return div;
}

filterControl.addTo(map);

closeFilterButton.addEventListener("click", function(e) {
    filterSection.classList.toggle("collapse-filter");
    filterControl.addTo(map);
});


// Filter data
var progessButtons = document.querySelectorAll(".col .form-check");
progessButtons.forEach(progressButton => {
    progressButton.addEventListener("change", function(e) {
        let value = e.target.value;
        let currentYear = new Date().getFullYear();

        let data = JSON.parse(JSON.stringify(roadsData));
        roads.clearLayers();
        if(value == "completed") {
            data.features = data.features.filter(feature => feature.properties.year <= currentYear);
            roads.addData(data);
        } else if (value == "all") {
            roads.addData(data);
        } 
        else {
            data.features = data.features.filter(feature => feature.properties.year >= currentYear);
            roads.addData(data);
        }
    });
});

// select filters
var customSelect = document.querySelectorAll(".custom-select");

customSelect.forEach(cs => {
    cs.addEventListener("change", function(e) {
        let value = e.target.value;
        let name = e.target.name;

        roads.clearLayers();
        let data = JSON.parse(JSON.stringify(roadsData));

        if(value == "all") {
            roads.addData(data);
            return;
        }
        // filter accordingly
        if(name == "contractor") {
            data.features = data.features.filter(feature => feature.properties.contractor == value);
        } else if (name == "material") {
            data.features = data.features.filter(feature => feature.properties.material == value);
        } else if ( name == "surface") {
            data.features = data.features.filter(feature => feature.properties.surface == value);
        } else {

        }

        roads.addData(data);

    });
});

// Search 
searchInput.addEventListener("input", function(e) {
    let value = e.target.value;
    if(value.length >= 2) {
        filterRoadSegment(value);
    } else {
        searchResult.innerHTML = "";
    }
});

function filterRoadSegment(query) {
    // filter road matching the query
    let data = JSON.parse(JSON.stringify(roadsData));
    data.features = data.features.filter(feature => {
        let roadName = feature.properties.name;
        if(roadName && roadName.toLowerCase().includes(query.toLowerCase()) ) {
            return feature;
        }
    });

    // create list item
    if(data.features.length > 10) {
        data.features = data.features.slice(0,10);
    }

    if(data.features.length > 0) {
        let docFragment = document.createDocumentFragment();

        data.features.forEach(feature => {
            let listItem = document.createElement("li");
            listItem.setAttribute("class", "list-group-item");
            listItem.setAttribute("id", feature.properties.pk);
            listItem.setAttribute("data-name", feature.properties.name);

            listItem.innerHTML = feature.properties.name;

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
    let data = JSON.parse(JSON.stringify(roadsData));

    // get target attrinute;
    let target = e.target;
    let roadPk = target.getAttribute("id");
    let name = target.getAttribute("data-name");

    // update search input value
    searchInput.value = name;
    searchResult.innerHTML = "";

    // zoom to road layer
    data.features = data.features.filter(feature => feature.properties.pk == roadPk);
    console.log(data);

    // create a geojson with result
    let feature = L.geoJson(data, {
        style:function(feature) {
            return {
                color:"#c7f709",
                weight:4
            }
        }
    }).addTo(map);
    map.fitBounds(feature.getBounds());
}