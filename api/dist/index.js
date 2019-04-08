

var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);
var _server = require('./server');var _server2 = _interopRequireDefault(_server);
require('./setup');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

// Schedule a job.
_bluebird2['default']['try'](function () {return _server2['default'].start(cfg.API_PORT);})['catch'](
function (err) {return log.error(err);}); // Application entry point.