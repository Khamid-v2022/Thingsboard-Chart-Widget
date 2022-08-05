var check_array = [];

var myChart;
var chartDom;
var option;

self.onInit = function () {
  chartDom = $(".echart-heatmap", self.ctx.$container)[0];
  myChart = echarts.init(chartDom);
  self.onResize();
};

function draw() {
  var max = 0;
  var min = 0;

  let yAxis_legend = [];
  let xAxis_legend = [];
  let data = [];

  var series = Array();

  const hours = [
    "00:",
    "01:",
    "02:",
    "03:",
    "04:",
    "05:",
    "06:",
    "07:",
    "08:",
    "09:",
    "10:",
    "11:",
    "12:",
    "13:",
    "14:",
    "15:",
    "16:",
    "17:",
    "18:",
    "19:",
    "20:",
    "21:",
    "22:",
    "23:",
  ];

  for (var i = 0; i < self.ctx.data.length; i++) {
    let dataElement = Array();

    let y_legend = self.ctx.data[i].dataKey.label;
    yAxis_legend.push(y_legend);
    var dataSet = self.ctx.data[i].data;

    // get Last one day
    let max_timestamp = 0;
    for (var d = 0; d < dataSet.length; d++) {
      if (dataSet[d][0] > max_timestamp) max_timestamp = dataSet[d][0];
    }

    let limit_timestamp = max_timestamp - 24 * 3600 * 1000;

    for (var d = 0; d < dataSet.length; d++) {
      var tsValuePair = dataSet[d];
      var ts = tsValuePair[0];
      var value = tsValuePair[1];

      let date = new Date(ts).getDate();
      let hour = new Date(ts).getHours();

      //   if (!xAxis_legend.includes(hour)) xAxis_legend.push(hour);
      if (ts > limit_timestamp) {
        dataElement.push([y_legend, hour, parseFloat(value).toFixed()]);
        if (max < value) {
          max = parseInt(value);
        }

        if (min > value) {
          min = parseInt(value);
        }
      }
    }

    let con_data = [];
    con_data = dataElement.map(function (item) {
      return [item[1], item[0], item[2] || "-"];
    });

    let seriesElement = {
      name: y_legend,
      type: "heatmap",
      data: con_data,
      label: {
        show: self.ctx.settings.showDataInHeatmap,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    };

    series.push(seriesElement);
  }

  option = {
    tooltip: {
      position: "bottom",
      formatter: function (params) {
        return `${params.seriesName}<br />${params.data[0]}:00, Value: ${params.data[2]}`;
      },
    },
    // gradientColor: ["#f6efa6", "#d88273", "#bf444c"],
    grid: {
      height: "50%",
      top: "10%",
      left: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: hours,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: yAxis_legend,
      splitArea: {
        show: true,
      },
      axisLabel: {
        rotate: 30,
      },
    },
    visualMap: {
      min: min,
      max: max,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "15%",
    },
    series: series,
  };
  //   if (self.ctx.settings.style == "Green") {
  //     option.gradientColor = ["#e6ffe6", "#00ff00"];
  //   }

  option && myChart.setOption(option);
}

self.onDataUpdated = function () {
  draw();
};

self.onResize = function () {
  draw();
  myChart.resize();
  self.onDataUpdated();
};

self.onEditModeChanged = function () {};

self.getSettingsSchema = function () {};

self.getDataKeySettingsSchema = function () {};

self.onDestroy = function () {};
