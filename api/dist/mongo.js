Object.defineProperty(exports, "__esModule", { value: true });

var _mongodb = require('mongodb');var _mongodb2 = _interopRequireDefault(_mongodb);
var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} // MongoDB client utilities and queries.

var client = _mongodb2['default'].MongoClient;

_bluebird2['default'].promisifyAll(client);

var db = void 0;

// Connect to MongoDB instance.
var connect = function connect() {return _bluebird2['default']['try'](function () {
    if (db) {
      return db;
    }
    var url = void 0;
    if (cfg.MONGO_USER && cfg.MONGO_PASS) {
      url = 'mongodb://' + String(cfg.MONGO_USER) + ':' + String(cfg.MONGO_PASS) + '@' + String(cfg.MONGO_HOST) + ':' + String(cfg.MONGO_PORT) + '/' + String(cfg.MONGO_NAME) + '?authSource=admin';
    } else {
      url = 'mongodb://' + String(cfg.MONGO_HOST) + ':' + String(cfg.MONGO_PORT) + '/' + String(cfg.MONGO_NAME);
    }
    var options = { promiseLibrary: _bluebird2['default'] };
    return client.connect(url, options).
    then(function (connection) {
      log.info('Successfully connected to MongoDB.');
      db = connection;
      return db;
    });
  });};

// Disconnect from MongoDB instance.
var disconnect = function disconnect() {return _bluebird2['default']['try'](function () {
    if (db) {
      return db.close().then(function () {
        db = undefined;
        log.info('Disconnected from MongoDB.');
      });
    }
  });};

// Fetch logs from all the modules.
var findLogs = function findLogs(options) {return _bluebird2['default']['try'](function () {return connect();}).
  then(function () {return db.collection('logs').
    find({
      label: { $in: options.labels },
      level: { $in: options.levels } }).

    sort({ $natural: options.sort }).
    limit(options.limit).
    toArray();});};


// Find day.
var findDay = function findDay(date) {return _bluebird2['default']['try'](function () {return connect();}).
  then(function () {return db.collection('days').findOne({ _id: date });});};

// Fetch jobs.
var findJobs = function findJobs(options) {return _bluebird2['default']['try'](function () {return connect();}).
  then(function () {return db.collection('jobs').
    find({ status: { $in: options.status } }).
    sort({ $natural: options.sort }).
    limit(options.limit).
    toArray();});};


// Get all jobs.
var getAllJobs = function getAllJobs() {return _bluebird2['default']['try'](function () {return connect();}).
  then(function () {return db.collection('jobs').
    find().
    sort({ $natural: -1 }).
    toArray();});};exports['default'] =


{
  connect: connect,
  disconnect: disconnect,
  findLogs: findLogs,
  findJobs: findJobs,
  findDay: findDay,
  getAllJobs: getAllJobs };