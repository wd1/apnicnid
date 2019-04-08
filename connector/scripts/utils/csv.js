// CSV utilities.

/* eslint-disable import/prefer-default-export */

import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';
import csv from 'csv';
import path from 'path';
import rir from './rir';

Promise.promisifyAll(fs);
Promise.promisifyAll(csv);

// Just read CSV file into memory.
const readCsv = filepath => Promise.try(() => fs.readFileAsync(filepath, 'utf-8'));

// Get RIR header.
const getHeader = data =>
  _.first(data);

// Get RIR totals.
const getTotals = data =>
  _(data)
    .take(4)
    .drop(1)
    .value();

// Get RIR entries.
const getEntries = data =>
  _(data)
    .drop(4)
    .value();

// Convert header to usable object.
const parseHeader = (header) => {
  if (header === undefined) {
    return undefined;
  }
  return {
    version: Number.parseInt(header[0], 10),
    registry: header[1],
    serial: Number.parseInt(header[2], 10),
    records: Number.parseInt(header[3], 10),
    startDate: Number.parseInt(header[4], 10) || 19700101,
    endDate: Number.parseInt(header[5], 10),
  };
};

// Convert header to usable object.
const parseTotals = (totals) => {
  if (totals === undefined) {
    return undefined;
  }
  return {
    asn: {
      registry: totals[0][0].toLowerCase(),
      count: Number.parseInt(totals[0][totals[0].length - 2], 10),
    },
    ipv4: {
      registry: totals[1][0].toLowerCase(),
      count: Number.parseInt(totals[1][totals[1].length - 2], 10),
    },
    ipv6: {
      registry: totals[2][0].toLowerCase(),
      count: Number.parseInt(totals[2][totals[2].length - 2], 10),
    },
  };
};

// Convert all CSV entries to readable array of objects.
const parseEntries = (entries) => {
  if (entries === undefined) {
    return undefined;
  }
  return _(entries)
    .filter(entry => entry[6] !== 'available')
    .map((entry) => {
      // apnic|CN|ipv4|27.106.128.0|16384|20100608|allocated|A923B952
      const result = {
        registry: entry[0],
        country: entry[1].toLowerCase(),
        type: entry[2].toLowerCase(),
        start: entry[3],
        length: Number.parseInt(entry[4], 10),
        date: Number.parseInt(entry[5], 10),
        status: entry[6].toLowerCase(),
        opaque: entry[7],
      };

      return result;
    })
    .value();
};

// Get filename from filepath.
const parseFilename = filepath => path.basename(filepath).toLowerCase();

// Combine the results to single object.
const combine = (filepath, header, totals, entries) => {
  const result = {
    _id: rir.filenameToDate(filepath),
    filename: parseFilename(filepath),
    header: parseHeader(header, filepath),
    totals: parseTotals(totals, filepath),
    entries: parseEntries(entries),
  };

  if (result.header && result.totals && result.entries) {
    return result;
  }

  return undefined;
};

// Parse CSV with some rules.
const parseCsv = (filepath, content) => Promise.try(() => csv.parseAsync(content, {
  comment: '#',
  delimiter: '|',
  relax_column_count: true,
}))
  .then(data => Promise.all([
    getHeader(data),
    getTotals(data),
    getEntries(data),
  ]))
  .spread((header, totals, entries) =>
    combine(filepath, header, totals, entries),
  );

export default {
  readCsv,
  parseCsv,
};

