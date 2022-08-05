var myChart;
var chartDom;
var option;

var api_key = "f73956b8d22c2efb182297ee32143507";
//every 3 hours for 5 days
var api_url = "https://api.openweathermap.org/data/2.5/forecast";
const DIFF_KELVIN = 273.15;

// ex:  http://openweathermap.org/img/wn/10d@2x.png
var icon_url = "http://openweathermap.org/img/wn/";

var weather_data = [];
var max_temp = 0;
var min_temp = 0;

var ROOT_PATH = "https://echarts.apache.org/examples";

self.onInit = function () {
  // get weather from API
  const location = self.ctx.settings.city || "London";

  let url = api_url + "?q=" + location + "&appid=" + api_key;
  $.get(url, function (resp) {
    weather_data = resp.list.slice(-16);
    self.onResize();
  });

  chartDom = $(".echart-weather", self.ctx.$container)[0];
  myChart = echarts.init(chartDom);

  self.onResize();
};

function draw() {
  let weatherData = weather_data.map(function (entry) {
    if (max_temp < entry.main.temp - DIFF_KELVIN)
      max_temp = (entry.main.temp - DIFF_KELVIN).toFixed(2);
    if (min_temp > entry.main.temp - DIFF_KELVIN)
      min_temp = (entry.main.temp - DIFF_KELVIN).toFixed(2);
    return [
      entry.dt_txt,
      (entry.main.temp - DIFF_KELVIN).toFixed(2),
      (entry.main.temp_min - DIFF_KELVIN).toFixed(2),
      (entry.main.temp_max - DIFF_KELVIN).toFixed(2),
      entry.weather[0].main,
      entry.weather[0].description,
      icon_url + entry.weather[0].icon + ".png",
    ];
  });

  const dims = {
    time: 0,
    temp: 1,
    minTemp: 2,
    maxTemp: 3,
    weatherMain: 4,
    weatherDesc: 5,
    weatherIcon: 6,
  };

  const weatherIconSize = 45;

  const renderWeather = function (param, api) {
    const point = api.coord([api.value(dims.time), 0]);
    return {
      type: "group",
      children: [
        {
          type: "image",
          style: {
            image: api.value(dims.weatherIcon),
            x: -weatherIconSize / 2,
            y: -weatherIconSize / 2,
            width: weatherIconSize,
            height: weatherIconSize,
          },
          position: [point[0], 50],
        },
      ],
    };
  };

  option = {
    title: {
      text:
        (self.ctx.settings.city || "") + " " + (self.ctx.settings.title || ""),
      subtext: "",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        return [
          echarts.format.formatTime("yyyy-MM-dd", params[0].value[dims.time]) +
            " " +
            echarts.format.formatTime("hh", params[0].value[dims.time]),
          params[0].value[dims.weatherDesc],
          "Temp: " + params[0].value[dims.temp],
        ].join("<br>");
      },
    },
    grid: {
      top: 50,
      bottom: 20,
    },
    xAxis: {
      type: "time",
      maxInterval: 3600 * 1000 * 24,
      splitLine: {
        lineStyle: {
          color: "#ddd",
        },
      },
    },
    yAxis: [
      {
        name: "Temp",
        nameLocation: "middle",
        nameGap: 35,
        max: max_temp + 10,
        min: min_temp - 10,
        axisLine: {
          lineStyle: {
            color: "#cc0022",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#ddd",
          },
        },
      },
      {
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        type: "line",
        yAxisIndex: 1,
        showSymbol: false,
        emphasis: {
          scale: false,
        },
        symbolSize: 10,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            global: false,
            colorStops: [
              {
                offset: 0,
                color: "rgba(88,160,253,1)",
              },
              {
                offset: 0.5,
                color: "rgba(88,160,253,0.7)",
              },
              {
                offset: 1,
                color: "rgba(88,160,253,0)",
              },
            ],
          },
        },
        lineStyle: {
          color: "rgba(88,160,253,1)",
        },
        itemStyle: {
          color: "rgba(88,160,253,1)",
        },
        encode: {
          x: dims.time,
          y: dims.temp,
        },
        data: weatherData,
        z: 3,
      },
      {
        type: "line",
        symbol: "none",
        encode: {
          x: dims.time,
          y: dims.minTemp,
        },
        lineStyle: {
          color: "#a00",
          type: "dotted",
        },
        data: weatherData,
        z: 2,
      },
      {
        type: "line",
        symbol: "none",
        encode: {
          x: dims.time,
          y: dims.maxTemp,
        },
        lineStyle: {
          color: "#0a0",
          type: "dotted",
        },
        data: weatherData,
        z: 1,
      },
      {
        type: "custom",
        renderItem: renderWeather,
        data: weatherData,
        tooltip: {
          trigger: "item",
          formatter: function (param) {
            return (
              param.value[dims.time].substr(0, 13) +
              ": " +
              param.value[dims.minTemp] +
              " - " +
              param.value[dims.maxTemp] +
              "°"
            );
          },
        },
        yAxisIndex: 1,
        z: 11,
      },
    ],
  };
  myChart.setOption(option);
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
