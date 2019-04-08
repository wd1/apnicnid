// Application entry point.

import Promise from 'bluebird';
import server from './server';
import './setup';

// Schedule a job.
Promise.try(() => server.start(cfg.API_PORT))
  .catch(err => log.error(err));

