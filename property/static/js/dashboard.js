var ctxLine = document.getElementById('construction-chart').getContext('2d');

var roadsChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels:["2013", "2014", "2015", "2016", "2017"],
        datasets:[{
            data:[2, 5, 10, 25, 15],
            backgroundColor:"#36384480"
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Road Construction'
        },
        legend: {
            display: false,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }],
            xAxes:[{
                ticks:{
                    beginAtZero: false,
                    stepSize: 3
                }
            }]
        }
    }
});

// Maintenace chart
var ctxLine = document.getElementById('maintenance-chart').getContext('2d');

var maintenanceChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels:["2013", "2014", "2015", "2016", "2017"],
        datasets:[{
            label: "# of Maintenance",
            data:[8, 10, 3, 7, 1],
            backgroundColor:"#36384480"
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Road Maintenance'
        },
        legend: {
            display: false,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }]
        }
    }
});

// structure-chart
var ctxLine = document.getElementById('structure-chart').getContext('2d');

var roadStructureChart = new Chart(ctxLine, {
    type: 'bar',
    data: {
        labels:["NULL", "base", "Pavement", "Bitumen", "Sub base"],
        datasets:[{
            label: "Road Structure",
            data:[8, 10, 12, 7, 10],
            backgroundColor:'#EC877B'
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Road Structure'
        },
        legend: {
            display: false,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
    }
});

// structure-chart
var ctxLine = document.getElementById('surface-chart').getContext('2d');

var roadSurfaceChart = new Chart(ctxLine, {
    type: 'bar',
    data: {
        labels:["NULL", "Asphalt", "Earth", "Murram", "Paved", "Unpaved"],
        datasets:[{
            label: "Road Surface",
            data:[8, 10, 12, 7, 10, 4],
            backgroundColor: "#EC877B"
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Road Surface'
        },
        legend: {
            display: false,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
    }
});

// load the data
fetch("/dashboard_data/")
.then(response => {
    return response.json();
})
.then(data => {
    console.log(data);
    let {construction, maintenance, structure, surface} = data;

    // construction
    let [years, constructionCount] = cleanAndSort(construction, "constructi");
    roadsChart.data.labels = years;
    roadsChart.data.datasets[0].data = constructionCount
    roadsChart.update();

    // Maintenance
    let [maintenanceYears, maintenanceCount] = cleanAndSort(maintenance, "maintenanc");

    maintenanceChart.data.labels = maintenanceYears;
    maintenanceChart.data.datasets[0].data = maintenanceCount;
    maintenanceChart.update();

    // surface
    console.log(surface);
    roadSurfaceChart.data.labels = surface.map(el => el.surface);
    roadSurfaceChart.data.datasets[0].data =  surface.map(el => el.count);
    roadSurfaceChart.update();

    // structure
    console.log(structure);
    roadStructureChart.data.labels = structure.map(el => el.road_struc);
    roadStructureChart.data.datasets[0].data =  structure.map(el => el.count);
    roadStructureChart.update();


})
.catch(error => {
    console.log(error);
});

function cleanAndSort(data, field) {
    newData = data.filter(element => element[field]).map(element => {
        element.year = parseInt(element[field].split(',')[1]);
        return element;
    });

    newData = newData.sort((a, b) => a.year - b.year);
    let years = newData.map(el => el.year);
    let values = newData.map(el =>  el.count);

    return [years, values]
}

// filter 
let contractorsData = document.getElementById("contractors").innerHTML;

// clean the string an create an array
let cleanData = contractorsData.trim().slice(13, -4).replaceAll("'", "\"");
cleanData = cleanData.replace("None", "\"None\"");
cleanData = JSON.parse(cleanData, function(key, value) {
    return value;
});

var contractorList = document.getElementById("contrators-list");
var formContractor = document.getElementById("search-contractor");

formContractor.addEventListener("input", function(e) {
    let value = e.target.value;
    console.log(value);

    if(value) {
        filterContractors(value);
    } else {
        updateListElements(cleanData);
    }
});

function filterContractors(value) {
    let contractors = JSON.parse(JSON.stringify(cleanData));
    contractors = contractors.filter(contractor => {
        if(
            contractor.contractor.toLowerCase().includes(value.toLowerCase())
        ) {
            return contractor
        }
    });

    console.log(contractors);

    if(contractors.length == 0) {
        contractorList.innerHTML = "No result found";
        return;
    } 

    updateListElements(contractors);

    
}


function updateListElements(contractors) {
    let innerText = "";
    contractors.forEach(contractor => {
        innerText += `<li class="list-group-item d-flex justify-content-between align-items-center">
            ${ contractor.contractor.slice(0,1).toUpperCase() + contractor.contractor.slice(1,).toLowerCase() }
            <span class="badge badge-brand badge-pill">${contractor.contracts_count}</span>
        </li>`
    });

    // update the list group element
    contractorList.innerHTML = innerText;
}

