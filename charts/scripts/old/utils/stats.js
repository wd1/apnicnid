/* eslint-disable no-loop-func, max-len */
import Promise from 'bluebird';
import 'whatwg-fetch';
import _ from 'lodash';
import moment from 'moment';
import math from 'mathjs';
import colors from './colors';
import {
  sumSquares,
  mergeSum,
} from './misc';

const stats = {
  API_STATS: process.env.API_STATS,

  start: undefined,
  end: undefined,
  from: undefined,
  to: undefined,
  updated: undefined,
  dates: [],
  segment: [],
  economies: [{
    id: 'all',
    label: 'ALL',
    color: colors.list[0],
    countries: [{
      id: 'all',
      label: 'ALL',
      color: colors.list[0],
    }],
  }],

  load() {
    return Promise.try(() => fetch(`${this.API_STATS}`))
      .then(response => response.json())
      .then((data) => {
        this.updateEconomies(data.economies);
        this.start = data.statistics.start;
        this.end = data.statistics.end;
        this.updated = data.statistics.updated;
        this.dates = data.statistics.dates;
      });
  },

  updateEconomies(list) {
    _.each(list, (country) => {
      const subregion = country.subregion || 'NO SUBREGION';
      const subregionIndex = _.findIndex(this.economies, economy =>
        subregion.toLowerCase() === economy.id,
      );
      if (subregionIndex === -1) {
        this.economies.push({
          id: subregion.toLowerCase(),
          label: subregion,
          color: colors.list[this.economies.length],
          countries: [{
            id: 'all',
            label: 'ALL',
            color: colors.list[0],
          }, {
            id: country.code,
            label: country.country,
            color: colors.list[1],
          }],
        });
      } else {
        this.economies[subregionIndex].countries.push({
          id: country.code,
          label: country.country,
          color: colors.list[this.economies[subregionIndex].countries.length],
        });
      }
    });
  },

  getYear(start, offset) {
    const s = moment(String(start), 'YYYYMMDD');
    const e = s.add(offset, 'days');
    return e.year();
  },

  dayDiff(start, end) {
    const s = moment(String(start), 'YYYYMMDD');
    const e = moment(String(end), 'YYYYMMDD');
    const diff = e.diff(s, 'days');
    return Number.parseInt(diff, 10);
  },

  slice(from, to) {
    this.from = from;
    this.to = to;
    this.segment = _.slice(
      this.dates,
      this.dayDiff(this.start, from),
      this.dayDiff(this.start, to),
    );
  },

  getColorBySubregionLabel(label) {
    let color;
    for (let i = 0; i < this.economies.length; i += 1) {
      if (this.economies[i].label === label) {
        color = this.economies[i].color;
        break;
      }
    }
    return color;
  },

  getColorByCountryLabel(label) {
    let color;
    for (let i = 0; i < this.economies.length; i += 1) {
      color = undefined;
      for (let j = 0; j < this.economies[i].countries.length; j += 1) {
        if (this.economies[i].countries[j].label === label) {
          color = this.economies[i].countries[j].color;
          break;
        }
      }
      if (color) break;
    }
    return color;
  },

  getEconomyLabelByCountryId(code) {
    let label;
    for (let i = 0; i < this.economies.length; i += 1) {
      label = undefined;
      for (let j = 0; j < this.economies[i].countries.length; j += 1) {
        if (this.economies[i].countries[j].id === code) {
          label = this.economies[i].label;
          break;
        }
      }
      if (label) break;
    }
    return label;
  },

  getCountryLabelByCountryId(code) {
    let label;
    for (let i = 0; i < this.economies.length; i += 1) {
      label = undefined;
      for (let j = 0; j < this.economies[i].countries.length; j += 1) {
        if (this.economies[i].countries[j].id === code) {
          label = this.economies[i].countries[j].label;
          break;
        }
      }
      if (label) break;
    }
    return label;
  },

  getEconomyIdByCountryId(code) {
    let id;
    for (let i = 0; i < this.economies.length; i += 1) {
      id = undefined;
      for (let j = 0; j < this.economies[i].countries.length; j += 1) {
        if (this.economies[i].countries[j].id === code) {
          id = this.economies[i].id;
          break;
        }
      }
      if (id) break;
    }
    return id;
  },

  getBarData(type, subregion, country) {
    const results = {};
    const field = `${type}NewSum`;
    const allLabels = {};
    const allColors = {};
    let year;
    let yearIndex;
    let minYear = 9999;
    let maxYear = 0;
    let label;
    let color;
    let getLabel;
    let getColor;
    const isRelevant = (countryId) => {
      if (subregion === 'all' && country === 'all') {
        return true;
      } else if (subregion !== 'all' && country === 'all') {
        return subregion === this.getEconomyIdByCountryId(countryId);
      } else if (subregion !== 'all' && country !== 'all') {
        return country === countryId;
      }
      return false;
    };

    if (subregion === 'all') {
      getLabel = this.getEconomyLabelByCountryId.bind(this);
      getColor = this.getColorBySubregionLabel.bind(this);
    } else {
      getLabel = this.getCountryLabelByCountryId.bind(this);
      getColor = this.getColorByCountryLabel.bind(this);
    }

    for (let i = 0; i < this.segment.length; i += 1) {
      year = this.getYear(this.from, i);
      if (year < minYear) minYear = year;
      if (year > maxYear) maxYear = year;
      _.each(this.segment[i], (value, key) => {
        label = getLabel(key);
        if (!allColors[label]) {
          color = getColor(label);
          allColors[label] = color;
        }
        if (key !== '' &&
            isRelevant(key) &&
            value &&
            value[field] &&
            !Number.isNaN(value[field])) {
          if (!allLabels[label]) allLabels[label] = true;

          if (results[label]) {
            yearIndex = _.findIndex(results[label], result => result.year === year);
            if (yearIndex === -1) {
              results[label].push({ year, total: value[field] });
            } else if (type === 'ipv6') {
              results[label][yearIndex].total = mergeSum(results[label][yearIndex].total, value[field]);
            } else {
              results[label][yearIndex].total += value[field];
            }
          } else {
            results[label] = [{ year, total: value[field] }];
          }
        }
      });
    }

    /* eslint-disable no-param-reassign, no-shadow */
    if (type === 'ipv6') {
      _.each(results, (economy) => {
        _.each(economy, (year) => {
          year.total = parseInt(math.divide(
            math.bignumber(sumSquares(year.total)),
            math.bignumber('1e28'),
          ).toString(), 10);
        });
      });
    }
    /* eslint-enable no-param-reassign, no-shadow */

    _.each(results, (result) => {
      for (let i = minYear; i <= maxYear; i += 1) {
        const index = _.findIndex(result, r => r.year === i);
        if (index === -1) {
          result.push({ year: i, total: 0 });
        }
      }
    });
    const finalResults = {};
    _.each(allLabels, (l, key) => {
      if (!results[key]) {
        results[key] = [];
        for (let i = minYear; i <= maxYear; i += 1) {
          results[key].push({ year: i, total: 0 });
        }
      }
      console.log('Label 1 : ', key);
      finalResults[key] = { values: results[key], color: allColors[key] };
    });

    return finalResults;
  },

  getPieData(type, subregion) {
    const results = [];
    const allColors = {};
    const field = `${type}NewSum`;
    let label;
    let color;
    let getLabel;
    let index;
    let getColor;
    const isRelevant = (countryId) => {
      if (subregion === 'all') {
        return true;
      } else if (subregion !== 'all') {
        return subregion === this.getEconomyIdByCountryId(countryId);
      }
      return false;
    };

    if (subregion === 'all') {
      getLabel = this.getEconomyLabelByCountryId.bind(this);
      getColor = this.getColorBySubregionLabel.bind(this);
    } else {
      getLabel = this.getCountryLabelByCountryId.bind(this);
      getColor = this.getColorByCountryLabel.bind(this);
    }

    for (let i = 0; i < this.segment.length; i += 1) {
      _.each(this.segment[i], (value, key) => {
        label = getLabel(key);
        if (!allColors[label]) {
          color = getColor(label);
          allColors[label] = color;
        }
        if (key !== '' &&
            isRelevant(key) &&
            value &&
            value[field] &&
            !Number.isNaN(value[field])) {
          index = _.findIndex(results, result => result.label === label);
          if (index === -1) {
            results.push({
              label,
              total: value[field],
              color: allColors[label],
            });
          } else if (type === 'ipv6') {
            results[index].total = mergeSum(results[index].total, value[field]);
          } else {
            results[index].total += value[field];
          }
        }
      });
    }

    if (type === 'ipv6') {
      return _.map(results, result => ({
        label: result.label,
        color: result.color,
        total: parseInt(math.divide(
          math.bignumber(sumSquares(result.total)),
          math.bignumber('1e28'),
        ).toString(), 10),
      }));
    }
    return results;
  },

};

export default stats;
