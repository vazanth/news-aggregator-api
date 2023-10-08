const schedule = require('node-schedule');
const AppResponse = require('../helpers/AppResponse');
const { updateNewsCache } = require('../services/newsService');

let jobName = null;

const startSchedule = (req, res, next) => {
  if (!jobName) {
    // Defined the cron schedule: run the update news cache function every 2 hours at minute 0
    const cronSchedule = '50 * * * *';

    jobName = schedule.scheduleJob(cronSchedule, () => {
      updateNewsCache();
    });

    return next(new AppResponse('Schedule started succesfully', 200));
  }

  return next(new AppResponse('Schedule is already running', 200));
};

const stopSchedule = (req, res, next) => {
  if (jobName) {
    jobName.cancel();
    jobName = null;

    return next(new AppResponse('Schedule stopped succesfully', 200));
  }

  return next(new AppResponse('Schedule is already stopped', 200));
};

module.exports = { startSchedule, stopSchedule };
