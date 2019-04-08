import _ from 'lodash';
import math from 'mathjs';

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
  mergeSum,
  sumSquares,
};
