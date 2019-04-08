import google from 'google'; // eslint-disable-line
import _ from 'lodash';
import stats from './stats';
import constants from './constants';

const drawBar = () => {
  const chart = new google.visualization.ColumnChart(document.getElementById('bar'));
  const options = {
    width: 840,
    height: 400,
    legend: { position: 'bottom', maxLines: 3 },
    bar: { groupWidth: '75%' },
    isStacked: true,
    animation: {
      duration: 400,
      easing: 'out',
      startup: true,
    },
  };

  stats.loadBar({
    registry: 'apnic',
    type: 'asn',
    statuses: ['assigned', 'allocated'],
    years: _.range(2008, 2017),
    economies: constants.SUBREGIONS,
    groupBy: 'subregion',
  }).then((result) => {
    const view = new google.visualization.DataView(
      google.visualization.arrayToDataTable(result),
    );
    chart.draw(view, options);
  });
};

const drawPie = () => {
  const chart = new google.visualization.PieChart(document.getElementById('pie'));
  const options = {
    width: 840,
    height: 400,
    legend: { position: 'bottom', maxLines: 3 },
    animation: {
      duration: 400,
      easing: 'out',
      startup: true,
    },
  };

  stats.loadPie({
    registry: 'apnic',
    type: 'asn',
    statuses: ['assigned', 'allocated'],
    economies: constants.SUBREGIONS,
    groupBy: 'subregion',
  }).then((result) => {
    const view = new google.visualization.DataView(
      google.visualization.arrayToDataTable(result),
    );
    chart.draw(view, options);
  });
};

const drawMap = () => {
  const chart = new google.visualization.GeoChart(document.getElementById('map'));

  const options = {
    width: 840,
    height: 400,
    legend: { position: 'bottom', maxLines: 3 },
    region: '009',
    animation: {
      duration: 400,
      easing: 'out',
      startup: true,
    },
  };

  stats.loadMap({
    registry: 'apnic',
    type: 'asn',
    statuses: ['assigned', 'allocated'],
    economies: [
      'as', 'au', 'ck', 'fj', 'fm', 'gu', 'ki', 'mh',
      'mp', 'nc', 'nf', 'nr', 'nu', 'nz', 'pf', 'pg',
      'pn', 'pw', 'sb', 'tf', 'tk', 'to', 'tv', 'vu',
      'wf', 'ws',
    ],
    groupBy: 'country',
  }).then((result) => {
    console.log(result);
    const data = google.visualization.arrayToDataTable(result);
    chart.draw(data, options);
  });
};

const drawCharts = () => {
  drawBar();
  drawPie();
  drawMap();
};

google.charts.load('current', {
  packages: ['corechart', 'geochart'],
  mapsApiKey: 'AIzaSyDh-uzJs9F3u1XYQyPyQS8B3EXOKw2wgJc',
});
google.charts.setOnLoadCallback(drawCharts);
