Object.defineProperty(exports, "__esModule", { value: true });var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _moment = require('moment');var _moment2 = _interopRequireDefault(_moment);
var _express = require('express');var _express2 = _interopRequireDefault(_express);
var _mongo = require('../../mongo');var _mongo2 = _interopRequireDefault(_mongo);
var _economies = require('../../utils/economies');var _economies2 = _interopRequireDefault(_economies);
var _asn = require('../../utils/asn');var _asn2 = _interopRequireDefault(_asn);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var router = new _express2['default'].Router();

var validRegistries = ['apnic'];
var validResources = ['asn', 'ipv4', 'ipv6'];
var validStatuses = ['available', 'assigned', 'reserved', 'allocated', 'reserved'];
var validGroupBys = ['country', 'subregion'];

var findProcessedFiles = function findProcessedFiles(jobs) {
  var files = [];
  _lodash2['default'].each(jobs, function (job) {
    if (job.status === 'completed') {
      files = _lodash2['default'].concat(files, job.files);
    }
  });
  return files;
};

var findLastProcessedDate = function findLastProcessedDate(files) {
  var file = _lodash2['default'].sortBy(files)[files.length - 1];
  return Number.parseInt(file.substr(file.length - 12), 10);
};

var interpretRegistry = function interpretRegistry(data) {
  if (data) {
    var lower = data.toLowerCase();
    var splits = lower.split(',');
    var ok = true;
    _lodash2['default'].each(splits, function (split) {
      var flag = false;
      _lodash2['default'].each(validRegistries, function (registry) {
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

var interpretResource = function interpretResource(data) {
  if (data) {
    var lower = data.toLowerCase();
    var splits = lower.split(',');
    var ok = true;
    _lodash2['default'].each(splits, function (split) {
      var flag = false;
      _lodash2['default'].each(validResources, function (resource) {
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

var interpretStatus = function interpretStatus(data) {
  if (data) {
    var lower = data.toLowerCase();
    var splits = lower.split(',');
    var ok = true;
    _lodash2['default'].each(splits, function (split) {
      var flag = false;
      _lodash2['default'].each(validStatuses, function (status) {
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

var interpretDate = function interpretDate(data) {
  var day = Number.parseInt(data, 10);
  if (data && !Number.isNaN(day)) {
    if (data.length === 8) {
      return day;
    } else if (data.length === 6) {
      day = day * 100 + (0, _moment2['default'])(data, 'YYYYMM').daysInMonth();
      return day;
    } else if (data.length === 4) {
      day = day * 10000 + 1231;
      return day;
    }
  } else if (data === 'latest') {
    return data;
  }
  return false;
};

var isSubregion = function isSubregion(data) {
  if (_economies2['default'].full[data]) return true;
  return false;
};

var convertSubregionToCodeList = function convertSubregionToCodeList(subregion) {return _economies2['default'].full[subregion];};

var interpretEconomy = function interpretEconomy(data) {
  if (data) {
    var lower = data.toLowerCase();
    var splits = _lodash2['default'].map(lower.split(','), function (split) {return decodeURIComponent(split);});
    var countries = [];
    _lodash2['default'].each(splits, function (split) {
      if (isSubregion(split)) {
        countries = _lodash2['default'].concat(countries, convertSubregionToCodeList(split));
      } else {
        countries.push(split);
      }
    });
    var ok = true;
    _lodash2['default'].each(countries, function (country) {
      var flag = false;
      _lodash2['default'].each(_economies2['default'].codes, function (value, key) {
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

var interpretGroupBy = function interpretGroupBy(data) {
  if (data) {
    var lower = data.toLowerCase();
    var ok = false;
    _lodash2['default'].each(validGroupBys, function (validGroupBy) {
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

var interpretStart = function interpretStart(data) {
  var day = Number.parseInt(data, 10);
  if (data && !Number.isNaN(day)) {
    if (data.length === 8) {
      day = Number.parseInt((0, _moment2['default'])(data, 'YYYYMMDD').
      subtract(1, 'days').
      format('YYYYMMDD'), 10);
      return day;
    } else if (data.length === 6) {
      day = Number.parseInt((0, _moment2['default'])(data, 'YYYYMM').
      format('YYYYMMDD'), 10);
      return day;
    } else if (data.length === 4) {
      day = Number.parseInt((0, _moment2['default'])(data, 'YYYY').
      format('YYYYMMDD'), 10);
      return day;
    }
  } else if (data === 'latest') {
    return 666; // what? >:)
  }
  return false;
};

var initialize = function initialize(options) {
  var result = {};
  var isAsn = !!_lodash2['default'].find(options.resource, function (resource) {return resource === 'asn';});
  var isIpv4 = !!_lodash2['default'].find(options.resource, function (resource) {return resource === 'ipv4';});
  var isIpv6 = !!_lodash2['default'].find(options.resource, function (resource) {return resource === 'ipv6';});

  var list = [];
  if (options.groupBy === 'country') {
    list = options.economy;
  } else if (options.groupBy === 'subregion') {
    _lodash2['default'].each(options.economy, function (economy) {
      list = _lodash2['default'].concat(list, _economies2['default'].subregionFromCode(economy));
    });
    list = _lodash2['default'].uniq(list);
  }

  _lodash2['default'].each(list, function (item) {
    result[item] = {};
    if (isAsn) {
      result[item].asn = {
        count: 0,
        total: 0,
        twoByte: 0,
        fourByte: 0 };

    }
    if (isIpv4) {
      result[item].ipv4 = {
        count: 0,
        total: 0,
        twentyFourBit: 0 };

    }
    if (isIpv6) {
      result[item].ipv6 = {
        count: 0,
        total: 0,
        thirtyTwoBit: 0,
        fourtyEightBit: 0 };

    }
  });

  return result;
};

var format = function format(options, list) {
  var isRegistry = void 0;
  var isResource = void 0;
  var isStatus = void 0;
  var isEconomy = void 0;
  var isStart = void 0;

  _lodash2['default'].remove(list, function (item) {
    isRegistry = false;
    isResource = false;
    isStatus = false;
    isEconomy = false;
    isStart = item.date >= options.start;
    _lodash2['default'].each(options.registry, function (registry) {
      if (registry === item.registry) {
        isRegistry = true;
        return false;
      }
    });
    _lodash2['default'].each(options.resource, function (resource) {
      if (resource === item.type) {
        isResource = true;
        return false;
      }
    });
    _lodash2['default'].each(options.status, function (status) {
      if (status === item.status) {
        isStatus = true;
        return false;
      }
    });
    _lodash2['default'].each(options.economy, function (economy) {
      if (economy === item.country) {
        isEconomy = true;
        return false;
      }
    });
    if (!isRegistry || !isResource || !isStatus || !isEconomy || !isStart) return true;
  });

  var results = initialize(options);
  var label = void 0;

  _lodash2['default'].each(list, function (item) {
    if (options.groupBy === 'country') label = item.country;else
    if (options.groupBy === 'subregion') label = _economies2['default'].subregionFromCode(item.country);

    results[label][item.type].total += item.length;
    results[label][item.type].count += 1;

    if (item.type === 'asn') {
      var isFourByte = _asn2['default'].toInteger(String(item.start)) > 65536;

      if (isFourByte) {
        results[label].asn.fourByte += item.length;
      } else {
        results[label].asn.twoByte += item.length;
      }
    } else if (item.type === 'ipv4') {
      var twentyFourBit = item.length >= 16777216;

      if (twentyFourBit) {
        results[label].ipv4.twentyFourBit += item.length;
      }
    } else if (item.type === 'ipv6') {
      var thirtyTwoBit = item.length <= 32;
      var fourtyEightBit = item.length > 32;

      if (thirtyTwoBit) {
        results[label].ipv6.thirtyTwoBit += item.length;
      } else if (fourtyEightBit) {
        results[label].ipv6.fourtyEightBit += item.length;
      }
    }
  });

  return results;
};

router.get('/economies', function (req, res) {
  res.json(_economies2['default'].full);
});

router.get('/:registry/:resource/:status/:date/:economy', function (req, res) {
  var registry = interpretRegistry(req.params.registry);
  var resource = interpretResource(req.params.resource);
  var status = interpretStatus(req.params.status);
  var groupBy = interpretGroupBy(req.query.groupBy);
  var date = interpretDate(req.params.date);
  var economy = interpretEconomy(req.params.economy);
  var start = interpretStart(req.params.date);

  var errors = [];
  if (!registry) errors.push({ message: 'Invalid registry.' });
  if (!resource) errors.push({ message: 'Invalid resource.' });
  if (!status) errors.push({ message: 'Invalid status.' });
  if (!date) errors.push({ message: 'Invalid date.' });
  if (!economy) errors.push({ message: 'Invalid economy.' });

  if (errors.length > 0) {
    res.status(400).json({
      errors: errors,
      help: 'Valid route is "/:registry/:resource/:status/:date/:economy?".' });

  } else if (date === 'latest') {
    _mongo2['default'].getAllJobs().
    then(findProcessedFiles).
    then(findLastProcessedDate).
    then(function (day) {return _mongo2['default'].findDay(day).
      then(function (list) {
        if (_lodash2['default'].isEqual(list, {})) {
          res.status(200).json([]);
        } else {
          res.json(format({
            registry: registry,
            resource: resource,
            status: status,
            date: date,
            economy: economy,
            groupBy: groupBy,
            start: start },
          list.entries));
        }
      });});
  } else {
    _mongo2['default'].findDay(date).
    then(function (list) {
      if (_lodash2['default'].isEqual(list, {})) {
        res.status(200).json([]);
      } else {
        res.json(format({
          registry: registry,
          resource: resource,
          status: status,
          date: date,
          economy: economy,
          groupBy: groupBy,
          start: start },
        list.entries));
      }
    });
  }
});exports['default'] =

router;