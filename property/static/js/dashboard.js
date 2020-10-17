var ctxLine = document.getElementById('collection-per-zone').getContext('2d');

var collectionPerZoneChart = new Chart(ctxLine, {
    type: 'bar',
    data: {
        labels:[],
        datasets:[{
            data:[],
            backgroundColor:"#0F4C5C95"
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Arrears Per Zone'
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
                    stepSize: 2500
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
var paymentMode = document.getElementById('payment-mode').getContext('2d');

var paymentModeChart = new Chart(paymentMode, {
    type: 'bar',
    data: {
        labels:[],
        datasets:[{
            label: "Payment Mode",
            data:[],
            backgroundColor:"#0F4C5C98"
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Payment Mode'
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
                    stepSize: 10
                }
            }]
        }
    }
});

// structure-chart
var collecitonHistory = document.getElementById('collection-history').getContext('2d');

var collectionHistoryChart = new Chart(collecitonHistory, {
    type: 'line',
    data: {
        labels:[],
        datasets:[{
            label: "Collection History",
            data:[],
            backgroundColor:'#0F4C5C78'
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Tax History'
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
                    stepSize: 10
                }
            }]
        }
    }
});

// load the data
fetch("/graph_data/")
.then(response => {
    return response.json();
})
.then(data => {
    console.log(data);
    let {arrear, collection, payment_mode } = data;

    // 
    console.log(collection.map(ar => Object.values(ar)[0]));
    collectionHistoryChart.data.labels = collection.map(ar => Object.keys(ar)[0]);
    collectionHistoryChart.data.datasets[0].data = collection.map(ar => Object.values(ar)[0]);
    collectionHistoryChart.update();

    // arrear
    paymentModeChart.data.labels = payment_mode.map(ar => Object.keys(ar)[0]);
    paymentModeChart.data.datasets[0].data = payment_mode.map(ar => Object.values(ar)[0]);
    paymentModeChart.update();

    // arrear
    console.log(arrear.map(ar => Object.keys(ar)[0]));
    collectionPerZoneChart.data.labels = arrear.map(ar => Object.keys(ar)[0]);
    collectionPerZoneChart.data.datasets[0].data = arrear.map(ar => Object.values(ar)[0]);
    collectionPerZoneChart.update();

})
.catch(error => {
    console.log(error);
});


