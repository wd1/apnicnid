

var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _appRootPath = require('app-root-path');var _appRootPath2 = _interopRequireDefault(_appRootPath);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _logger = require('./logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

// Export few things to global namespace for convenience.
// Setup stuff.
global.cfg = _config2['default'].create();global.log = _logger2['default'].start();
global.base = _appRootPath2['default'].path;

// Catch all uncaught errors and exceptions and log them.
process.on('unhandledRejection', function (error, promise) {
  log.error('unhandled rejection', { error: error, promise: promise });
});
process.on('uncaughtException', function (error) {
  log.error('uncaught exception', error);
});

// Log configuration variables.
_lodash2['default'].each(cfg, function (value, key) {
  log.info('Variable ' + String(key) + ' set to ' + String(value) + '.');
});