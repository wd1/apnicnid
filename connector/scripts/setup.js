// Setup stuff.

import _ from 'lodash';
import appRoot from 'app-root-path';
import config from './config';
import logger from './logger';

// Export few things to global namespace for convenience.
global.cfg = config.create();
global.log = logger.start();
global.base = appRoot.path;

// Catch all uncaught errors and exceptions and log them.
process.on('unhandledRejection', (error, promise) => {
  log.error('unhandled rejection', { error, promise });
});
process.on('uncaughtException', (error) => {
  log.error('uncaught exception', error);
});

// Log configuration variables.
_.each(cfg, (value, key) => {
  log.info(`Variable ${key} set to ${value}.`);
});
