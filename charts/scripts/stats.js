import Promise from 'bluebird';
import 'whatwg-fetch';
import _ from 'lodash';
import constants from './constants';

const loadBar = (opts) => {
  const responses = {};
  const type = opts.type;
  const statuses = _.join(opts.statuses);
  const economies = encodeURIComponent(_.join(opts.economies));
  const calls = _.map(opts.years, year =>
    fetch(`${constants.API_STATS}/${opts.registry}/${type}/${statuses}/${year}/${economies}?groupBy=${opts.groupBy}`)
      .then(res => res.json())
      .then((json) => { responses[year] = json; }),
  );

  return Promise.all(calls)
    .then(() => {
      const data = [_.concat(opts.groupBy, opts.economies)];
      _.each(opts.years, (year) => {
        const values = _.map(opts.economies, economy =>
          responses[year][economy.toUpperCase()][type].total);
        data.push(_.concat(String(year), values));
      });
      return data;
    });
};

const loadPie = (opts) => {
  const type = opts.type;
  const statuses = _.join(opts.statuses);
  const economies = encodeURIComponent(_.join(opts.economies));
  return fetch(`${constants.API_STATS}/${opts.registry}/${type}/${statuses}/latest/${economies}?groupBy=${opts.groupBy}`)
    .then(res => res.json())
    .then((json) => {
      const data = [[opts.groupBy, 'count']];
      _.each(opts.economies, (economy) => {
        data.push(_.concat(economy, json[economy.toUpperCase()][type].total));
      });
      return data;
    });
};

const loadMap = (opts) => {
  const type = opts.type;
  const statuses = _.join(opts.statuses);
  const economies = encodeURIComponent(_.join(opts.economies));
  return fetch(`${constants.API_STATS}/${opts.registry}/${type}/${statuses}/latest/${economies}?groupBy=${opts.groupBy}`)
    .then(res => res.json())
    .then((json) => {
      const data = [[opts.groupBy, 'count']];
      _.each(opts.economies, (economy) => {
        data.push(_.concat(economy, json[economy][type].total));
      });
      return data;
    });
};

export default {
  loadBar,
  loadPie,
  loadMap,
};
