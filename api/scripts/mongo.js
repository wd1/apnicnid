// MongoDB client utilities and queries.

import mongodb from 'mongodb';
import Promise from 'bluebird';

const client = mongodb.MongoClient;

Promise.promisifyAll(client);

let db;

// Connect to MongoDB instance.
const connect = () => Promise.try(() => {
  if (db) {
    return db;
  }
  let url;
  if (cfg.MONGO_USER && cfg.MONGO_PASS) {
    url = `mongodb://${cfg.MONGO_USER}:${cfg.MONGO_PASS}@${cfg.MONGO_HOST}:${cfg.MONGO_PORT}/${cfg.MONGO_NAME}?authSource=admin`;
  } else {
    url = `mongodb://${cfg.MONGO_HOST}:${cfg.MONGO_PORT}/${cfg.MONGO_NAME}`;
  }
  const options = { promiseLibrary: Promise };
  return client.connect(url, options)
    .then((connection) => {
      log.info('Successfully connected to MongoDB.');
      db = connection;
      return db;
    });
});

// Disconnect from MongoDB instance.
const disconnect = () => Promise.try(() => {
  if (db) {
    return db.close().then(() => {
      db = undefined;
      log.info('Disconnected from MongoDB.');
    });
  }
});

// Fetch logs from all the modules.
const findLogs = options => Promise.try(() => connect())
  .then(() => db.collection('logs')
    .find({
      label: { $in: options.labels },
      level: { $in: options.levels },
    })
    .sort({ $natural: options.sort })
    .limit(options.limit)
    .toArray(),
  );

// Find day.
const findDay = date => Promise.try(() => connect())
  .then(() => db.collection('days').findOne({ _id: date }));

// Fetch jobs.
const findJobs = options => Promise.try(() => connect())
  .then(() => db.collection('jobs')
    .find({ status: { $in: options.status } })
    .sort({ $natural: options.sort })
    .limit(options.limit)
    .toArray(),
  );

// Get all jobs.
const getAllJobs = () => Promise.try(() => connect())
  .then(() => db.collection('jobs')
    .find()
    .sort({ $natural: -1 })
    .toArray(),
  );

export default {
  connect,
  disconnect,
  findLogs,
  findJobs,
  findDay,
  getAllJobs,
};

