







var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _appRootPath = require('app-root-path');var _appRootPath2 = _interopRequireDefault(_appRootPath);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _logger = require('./logger');var _logger2 = _interopRequireDefault(_logger);
var _job = require('./utils/job');var _job2 = _interopRequireDefault(_job);
var _fsx = require('./utils/fsx');var _fsx2 = _interopRequireDefault(_fsx);
var _mongo = require('./mongo');var _mongo2 = _interopRequireDefault(_mongo);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

// Export few things to global namespace for convenience.
global.cfg = _config2['default'].create(); // IGNORE!
// Just a module to play with temporary stuff.
// ^_^
/* eslint-disable */ // Application entry point.
global.log = _logger2['default'].start();global.base = _appRootPath2['default'].path; // Catch all uncaught errors and exceptions and log them.
process.on('unhandledRejection', function (error, promise) {
  log.error('unhandled rejection', { error: error, promise: promise });
});
process.on('uncaughtException', function (error) {
  log.error('uncaught exception', error);
});