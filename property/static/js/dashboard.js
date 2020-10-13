var ctxLine = document.getElementById('contribution-chart').getContext('2d');

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

})
.catch(error => {
    console.log(error);
});


