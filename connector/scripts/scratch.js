// IGNORE!
// Just a module to play with temporary stuff.
// ^_^

/* eslint-disable */

// Application entry point.

import Promise from 'bluebird';
import path from 'path';
import _ from 'lodash';
import appRoot from 'app-root-path';
import config from './config';
import logger from './logger';
import job from './utils/job';
import fsx from './utils/fsx';
import mongo from './mongo';

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

