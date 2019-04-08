import dom2image from 'dom-to-image';
import _ from 'lodash';
import math from 'mathjs';

const download = (text, name, type) => {
  const a = document.createElement('a');
  const file = new Blob([text], { type });
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
};

const savePng = (id) => {
  const node = document.getElementById(id);
  dom2image.toBlob(node)
    .then((blob) => {
      download(blob, `${id}.png`, 'image/png');
    });
};

const saveSvg = (id) => {
  const node = document.getElementById(id);
  const text = node.innerHTML.toString();
  const result = `${text.substr(0, 5)} xmlns="http://www.w3.org/2000/svg" ${text.substr(5)}`;
  download(result, `${id}.svg`, 'image/svg+xml');
};

const saveJson = (data, id) => {
  download(
    JSON.stringify(data, null, 2),
    `${id}.json`,
    'text/json',
  );
};

const saveCsv = (data, id, type) => {
  let result;

  if (type === 'bar') {
    result = 'Economy,Year,Count\n';
    _.each(data, (value, key) => {
      _.each(value, (entry) => {
        result += `${key},${entry.year},${entry.total}\n`;
      });
    });
  } else if (type === 'pie') {
    result = 'Economy,Count\n';
    _.each(data, (entry) => {
      result += `${entry.label},${entry.total}\n`;
    });
  }

  download(result, `${id}.csv`, 'text/csv');
};

const mergeSum = (one, two) => {
  const result = {};

  _.each(one, (value, key) => {
    if (two[key]) {
      result[key] = value + two[key];
    } else {
      result[key] = value;
    }
  });

  _.each(two, (value, key) => {
    if (one[key] === undefined) {
      result[key] = value;
    }
  });

  return result;
};
const sumSquares = (entries) => {
  const bigtwo = math.bignumber(2);
  let sum = math.bignumber(0);
  _.each(entries, (value, key) => {
    const exponent = math.bignumber(Number.parseInt(key, 10));
    let item = math.bignumber(0);
    for (let i = 0; i < value; i += 1) {
      item = math.add(
        item,
        math.pow(bigtwo, exponent),
      );
    }
    sum = math.add(sum, item);
  });
  return sum.toString();
};

export {
  savePng,
  saveSvg,
  saveCsv,
  saveJson,
  mergeSum,
  sumSquares,
};
