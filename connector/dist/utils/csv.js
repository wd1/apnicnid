Object.defineProperty(exports, "__esModule", { value: true });



var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);
var _csv = require('csv');var _csv2 = _interopRequireDefault(_csv);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _rir = require('./rir');var _rir2 = _interopRequireDefault(_rir);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} // CSV utilities.
/* eslint-disable import/prefer-default-export */
_bluebird2['default'].promisifyAll(_fs2['default']);
_bluebird2['default'].promisifyAll(_csv2['default']);

// Just read CSV file into memory.
var readCsv = function readCsv(filepath) {return _bluebird2['default']['try'](function () {return _fs2['default'].readFileAsync(filepath, 'utf-8');});};

// Get RIR header.
var getHeader = function getHeader(data) {return (
    _lodash2['default'].first(data));};

// Get RIR totals.
var getTotals = function getTotals(data) {return (
    (0, _lodash2['default'])(data).
    take(4).
    drop(1).
    value());};

// Get RIR entries.
var getEntries = function getEntries(data) {return (
    (0, _lodash2['default'])(data).
    drop(4).
    value());};

// Convert header to usable object.
var parseHeader = function parseHeader(header) {
  if (header === undefined) {
    return undefined;
  }
  return {
    version: Number.parseInt(header[0], 10),
    registry: header[1],
    serial: Number.parseInt(header[2], 10),
    records: Number.parseInt(header[3], 10),
    startDate: Number.parseInt(header[4], 10) || 19700101,
    endDate: Number.parseInt(header[5], 10) };

};

// Convert header to usable object.
var parseTotals = function parseTotals(totals) {
  if (totals === undefined) {
    return undefined;
  }
  return {
    asn: {
      registry: totals[0][0].toLowerCase(),
      count: Number.parseInt(totals[0][totals[0].length - 2], 10) },

    ipv4: {
      registry: totals[1][0].toLowerCase(),
      count: Number.parseInt(totals[1][totals[1].length - 2], 10) },

    ipv6: {
      registry: totals[2][0].toLowerCase(),
      count: Number.parseInt(totals[2][totals[2].length - 2], 10) } };


};

// Convert all CSV entries to readable array of objects.
var parseEntries = function parseEntries(entries) {
  if (entries === undefined) {
    return undefined;
  }
  return (0, _lodash2['default'])(entries).
  filter(function (entry) {return entry[6] !== 'available';}).
  map(function (entry) {
    // apnic|CN|ipv4|27.106.128.0|16384|20100608|allocated|A923B952
    var result = {
      registry: entry[0],
      country: entry[1].toLowerCase(),
      type: entry[2].toLowerCase(),
      start: entry[3],
      length: Number.parseInt(entry[4], 10),
      date: Number.parseInt(entry[5], 10),
      status: entry[6].toLowerCase(),
      opaque: entry[7] };


    return result;
  }).
  value();
};

// Get filename from filepath.
var parseFilename = function parseFilename(filepath) {return _path2['default'].basename(filepath).toLowerCase();};

// Combine the results to single object.
var combine = function combine(filepath, header, totals, entries) {
  var result = {
    _id: _rir2['default'].filenameToDate(filepath),
    filename: parseFilename(filepath),
    header: parseHeader(header, filepath),
    totals: parseTotals(totals, filepath),
    entries: parseEntries(entries) };


  if (result.header && result.totals && result.entries) {
    return result;
  }

  return undefined;
};

// Parse CSV with some rules.
var parseCsv = function parseCsv(filepath, content) {return _bluebird2['default']['try'](function () {return _csv2['default'].parseAsync(content, {
      comment: '#',
      delimiter: '|',
      relax_column_count: true });}).

  then(function (data) {return _bluebird2['default'].all([
    getHeader(data),
    getTotals(data),
    getEntries(data)]);}).

  spread(function (header, totals, entries) {return (
      combine(filepath, header, totals, entries));});};exports['default'] =


{
  readCsv: readCsv,
  parseCsv: parseCsv };