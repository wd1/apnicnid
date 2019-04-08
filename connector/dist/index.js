

var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _job = require('./utils/job');var _job2 = _interopRequireDefault(_job);
var _fsx = require('./utils/fsx');var _fsx2 = _interopRequireDefault(_fsx);
var _mongo = require('./mongo');var _mongo2 = _interopRequireDefault(_mongo);
require('./setup');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

// Schedule a job.
// Application entry point.
_bluebird2['default']['try'](function () {if (cfg.CLEAN_START) {
    log.info('Cleaning previous ingestion...');
    return _mongo2['default'].clean().
    then(function () {return _fsx2['default'].removeDirectory(_path2['default'].join(base, cfg.FTP_LOCAL));}).
    then(function () {return _fsx2['default'].removeDirectory(_path2['default'].join(base, cfg.CSV_LOCATION));}).
    then(function () {return log.warn('Previous ingestion cleaned.');});
  }
}).
then(_mongo2['default'].invalidateJobs).
then(function (count) {
  if (count) log.warn('Invalidated ' + String(count) + ' old jobs.');
}).
then(_job2['default'].run)['catch'](
function (err) {return log.error(err);});