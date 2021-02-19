var chartSoc, chartTemp, chartCurrent

var updateGauge = function(data) {
    const parts = data.split("=");

    if (parts[0] == 'soc.val') {
        updateSoc(parts[1])
    } else if (parts[0] == 'temp.val') {
        updateTemp(parts[1])
    } else if (parts[0] == 'current.val') {
        updateCurrent(parts[1])
    }

};

var updateCurrent = function(newVal) {
    if (chartCurrent) {
        point = chartCurrent.series[0].points[0];
        point.update(parseInt(newVal)/ 10);
    }
}
  
var updateSoc = function(newVal) {
    if (chartSoc) {
        point = chartSoc.series[0].points[0];
        point.update(parseInt(newVal));
    }
}

var updateTemp = function(newVal) {
    if (chartTemp) {
        point = chartTemp.series[0].points[0];
        point.update(parseInt(newVal));
    }
}

var initGauges = function() {


    var initCurrentGauge = function() {
        var gaugeOptions = {
            chart: {
                type: 'solidgauge'
            },
        
            title: null,
        
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
        
            exporting: {
                enabled: false
            },
        
            tooltip: {
                enabled: false
            },
        
            // the value axis
            yAxis: {
                stops: [
                    [0.9, '#55BF3B'], // green
                    [0.8, '#DDDF0D'], // yellow
                    [0.1, '#DF5353'] // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },
        
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };
    
        chartCurrent = Highcharts.chart('container-current', Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 100,	
                title: {
                    text: 'Current'
                }
            },
        
            credits: {
                enabled: false
            },
        
            series: [{
                name: 'Current',
                data: [0],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">A</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' A'
                }
            }]
        
        }));
    }

    var initSocGauge = function() {
        var gaugeOptions = {
            chart: {
                type: 'solidgauge'
            },
        
            title: null,
        
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
        
            exporting: {
                enabled: false
            },
        
            tooltip: {
                enabled: false
            },
        
            // the value axis
            yAxis: {
                stops: [
                    [0.1, '#DF5353'], // red
                    [0.3, '#DDDF0D'], // yellow
                    [0.4, '#55BF3B'] // green
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },
        
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };
    
        chartSoc = Highcharts.chart('container-soc', Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 100,	
                title: {
                    text: 'State of Charge'
                }
            },
        
            credits: {
                enabled: false
            },
        
            series: [{
                name: 'SoC',
                data: [10],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">%</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' %'
                }
            }]
        
        }));
    }

    var initTempGauge = function() {
        var gaugeOptions = {
            chart: {
                type: 'solidgauge'
            },
        
            title: null,
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
        
            exporting: {
                enabled: false
            },
        
            tooltip: {
                enabled: false
            },
        
            // the value axis
            yAxis: {
                stops: [
                    [0.2, '#a4d4ff'], // blue
                    [0.3, '#55BF3B'], // green
                    [0.9, '#DF5353'] // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },
        
            plotOptions: {
                solidgauge: {
                    pointStart: 0,
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };
    
        chartTemp = Highcharts.chart('container-temp', Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: -5,
                max: 70,	
                title: {
                    text: 'Temp'
                }
            },
        
            credits: {
                enabled: false
            },
        
            series: [{
                name: 'Temp',
                data: [20],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">&#8451;</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' &#8451;'
                }
            }]
        
        }));
    }

    initSocGauge();
    initTempGauge();
    initCurrentGauge();

}