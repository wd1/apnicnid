import _ from 'lodash';
import moment from 'moment';
import express from 'express';
import mongo from '../../mongo';
import economies from '../../utils/economies';
import asn from '../../utils/asn';

const router = new express.Router();

const validRegistries = ['apnic'];
const validResources = ['asn', 'ipv4', 'ipv6'];
const validStatuses = ['available', 'assigned', 'reserved', 'allocated', 'reserved'];
const validGroupBys = ['country', 'subregion'];

const findProcessedFiles = (jobs) => {
  let files = [];
  _.each(jobs, (job) => {
    if (job.status === 'completed') {
      files = _.concat(files, job.files);
    }
  });
  return files;
};

const findLastProcessedDate = (files) => {
  const file = _.sortBy(files)[files.length - 1];
  return Number.parseInt(file.substr(file.length - 12), 10);
};

const interpretRegistry = (data) => {
  if (data) {
    const lower = data.toLowerCase();
    const splits = lower.split(',');
    let ok = true;
    _.each(splits, (split) => {
      let flag = false;
      _.each(validRegistries, (registry) => {
        if (registry === split) {
          flag = true;
          return false;
        }
      });
      if (!flag) {
        ok = false;
        return false;
      }
    });
    if (splits.length > 0 && ok) return splits;
  }
  return false;
};

const interpretResource = (data) => {
  if (data) {
    const lower = data.toLowerCase();
    const splits = lower.split(',');
    let ok = true;
    _.each(splits, (split) => {
      let flag = false;
      _.each(validResources, (resource) => {
        if (resource === split) {
          flag = true;
          return false;
        }
      });
      if (!flag) {
        ok = false;
        return false;
      }
    });
    if (splits.length > 0 && ok) return splits;
  }
  return false;
};

const interpretStatus = (data) => {
  if (data) {
    const lower = data.toLowerCase();
    const splits = lower.split(',');
    let ok = true;
    _.each(splits, (split) => {
      let flag = false;
      _.each(validStatuses, (status) => {
        if (status === split) {
          flag = true;
          return false;
        }
      });
      if (!flag) {
        ok = false;
        return false;
      }
    });
    if (splits.length > 0 && ok) return splits;
  }
  return false;
};

const interpretDate = (data) => {
  let day = Number.parseInt(data, 10);
  if (data && !Number.isNaN(day)) {
    if (data.length === 8) {
      return day;
    } else if (data.length === 6) {
      day = (day * 100) + moment(data, 'YYYYMM').daysInMonth();
      return day;
    } else if (data.length === 4) {
      day = (day * 10000) + 1231;
      return day;
    }
  } else if (data === 'latest') {
    return data;
  }
  return false;
};

const isSubregion = (data) => {
  if (economies.full[data]) return true;
  return false;
};

const convertSubregionToCodeList = subregion => economies.full[subregion];

const interpretEconomy = (data) => {
  if (data) {
    const lower = data.toLowerCase();
    const splits = _.map(lower.split(','), split => decodeURIComponent(split));
    let countries = [];
    _.each(splits, (split) => {
      if (isSubregion(split)) {
        countries = _.concat(countries, convertSubregionToCodeList(split));
      } else {
        countries.push(split);
      }
    });
    let ok = true;
    _.each(countries, (country) => {
      let flag = false;
      _.each(economies.codes, (value, key) => {
        if (key === country) {
          flag = true;
          return false;
        }
      });
      if (!flag) {
        ok = false;
        return false;
      }
    });
    if (countries.length > 0 && ok) return countries;
  }
  return false;
};

const interpretGroupBy = (data) => {
  if (data) {
    const lower = data.toLowerCase();
    let ok = false;
    _.each(validGroupBys, (validGroupBy) => {
      if (validGroupBy === lower) {
        ok = true;
        return false;
      }
    });
    if (ok) return lower;
    return false;
  }
  return 'country';
};

const interpretStart = (data) => {
  let day = Number.parseInt(data, 10);
  if (data && !Number.isNaN(day)) {
    if (data.length === 8) {
      day = Number.parseInt(moment(data, 'YYYYMMDD')
        .subtract(1, 'days')
        .format('YYYYMMDD'), 10);
      return day;
    } else if (data.length === 6) {
      day = Number.parseInt(moment(data, 'YYYYMM')
        .format('YYYYMMDD'), 10);
      return day;
    } else if (data.length === 4) {
      day = Number.parseInt(moment(data, 'YYYY')
        .format('YYYYMMDD'), 10);
      return day;
    }
  } else if (data === 'latest') {
    return 666; // what? >:)
  }
  return false;
};

const initialize = (options) => {
  const result = {};
  const isAsn = !!_.find(options.resource, resource => resource === 'asn');
  const isIpv4 = !!_.find(options.resource, resource => resource === 'ipv4');
  const isIpv6 = !!_.find(options.resource, resource => resource === 'ipv6');

  let list = [];
  if (options.groupBy === 'country') {
    list = options.economy;
  } else if (options.groupBy === 'subregion') {
    _.each(options.economy, (economy) => {
      list = _.concat(list, economies.subregionFromCode(economy));
    });
    list = _.uniq(list);
  }

  _.each(list, (item) => {
    result[item] = {};
    if (isAsn) {
      result[item].asn = {
        count: 0,
        total: 0,
        twoByte: 0,
        fourByte: 0,
      };
    }
    if (isIpv4) {
      result[item].ipv4 = {
        count: 0,
        total: 0,
        twentyFourBit: 0,
      };
    }
    if (isIpv6) {
      result[item].ipv6 = {
        count: 0,
        total: 0,
        thirtyTwoBit: 0,
        fourtyEightBit: 0,
      };
    }
  });

  return result;
};

const format = (options, list) => {
  let isRegistry;
  let isResource;
  let isStatus;
  let isEconomy;
  let isStart;

  _.remove(list, (item) => {
    isRegistry = false;
    isResource = false;
    isStatus = false;
    isEconomy = false;
    isStart = item.date >= options.start;
    _.each(options.registry, (registry) => {
      if (registry === item.registry) {
        isRegistry = true;
        return false;
      }
    });
    _.each(options.resource, (resource) => {
      if (resource === item.type) {
        isResource = true;
        return false;
      }
    });
    _.each(options.status, (status) => {
      if (status === item.status) {
        isStatus = true;
        return false;
      }
    });
    _.each(options.economy, (economy) => {
      if (economy === item.country) {
        isEconomy = true;
        return false;
      }
    });
    if (!isRegistry || !isResource || !isStatus || !isEconomy || !isStart) return true;
  });

  const results = initialize(options);
  let label;

  _.each(list, (item) => {
    if (options.groupBy === 'country') label = item.country;
    else if (options.groupBy === 'subregion') label = economies.subregionFromCode(item.country);

    results[label][item.type].total += item.length;
    results[label][item.type].count += 1;

    if (item.type === 'asn') {
      const isFourByte = asn.toInteger(String(item.start)) > 65536;

      if (isFourByte) {
        results[label].asn.fourByte += item.length;
      } else {
        results[label].asn.twoByte += item.length;
      }
    } else if (item.type === 'ipv4') {
      const twentyFourBit = item.length >= 16777216;

      if (twentyFourBit) {
        results[label].ipv4.twentyFourBit += item.length;
      }
    } else if (item.type === 'ipv6') {
      const thirtyTwoBit = item.length <= 32;
      const fourtyEightBit = item.length > 32;

      if (thirtyTwoBit) {
        results[label].ipv6.thirtyTwoBit += item.length;
      } else if (fourtyEightBit) {
        results[label].ipv6.fourtyEightBit += item.length;
      }
    }
  });

  return results;
};

router.get('/economies', (req, res) => {
  res.json(economies.full);
});

router.get('/:registry/:resource/:status/:date/:economy', (req, res) => {
  const registry = interpretRegistry(req.params.registry);
  const resource = interpretResource(req.params.resource);
  const status = interpretStatus(req.params.status);
  const groupBy = interpretGroupBy(req.query.groupBy);
  const date = interpretDate(req.params.date);
  const economy = interpretEconomy(req.params.economy);
  const start = interpretStart(req.params.date);

  const errors = [];
  if (!registry) errors.push({ message: 'Invalid registry.' });
  if (!resource) errors.push({ message: 'Invalid resource.' });
  if (!status) errors.push({ message: 'Invalid status.' });
  if (!date) errors.push({ message: 'Invalid date.' });
  if (!economy) errors.push({ message: 'Invalid economy.' });

  if (errors.length > 0) {
    res.status(400).json({
      errors,
      help: 'Valid route is "/:registry/:resource/:status/:date/:economy?".',
    });
  } else if (date === 'latest') {
    mongo.getAllJobs()
      .then(findProcessedFiles)
      .then(findLastProcessedDate)
      .then(day => mongo.findDay(day)
        .then((list) => {
          if (_.isEqual(list, {})) {
            res.status(200).json([]);
          } else {
            res.json(format({
              registry,
              resource,
              status,
              date,
              economy,
              groupBy,
              start,
            }, list.entries));
          }
        }));
  } else {
    mongo.findDay(date)
      .then((list) => {
        if (_.isEqual(list, {})) {
          res.status(200).json([]);
        } else {
          res.json(format({
            registry,
            resource,
            status,
            date,
            economy,
            groupBy,
            start,
          }, list.entries));
        }
      });
  }
});

export default router;

