// Application entry point.

import Promise from 'bluebird';
import path from 'path';
import job from './utils/job';
import fsx from './utils/fsx';
import mongo from './mongo';
import './setup';

// Schedule a job.
Promise.try(() => {
  if (cfg.CLEAN_START) {
    log.info('Cleaning previous ingestion...');
    return mongo.clean()
      .then(() => fsx.removeDirectory(path.join(base, cfg.FTP_LOCAL)))
      .then(() => fsx.removeDirectory(path.join(base, cfg.CSV_LOCATION)))
      .then(() => log.warn('Previous ingestion cleaned.'));
  }
})
  .then(mongo.invalidateJobs)
  .then((count) => {
    if (count) log.warn(`Invalidated ${count} old jobs.`);
  })
  .then(job.run)
  .catch(err => log.error(err));
