const schedule = require('node-schedule');
const AppResponse = require('../helpers/AppResponse');
const { updateNewsCache } = require('../services/newsService');
const { commonResponseMessages } = require('../data/constants');

let jobName = null;

const convertToCron = (scheduleType, scheduleValue) => {
  let cronExpression = '';

  if (scheduleType === 'daily') {
    cronExpression = `0 ${scheduleValue} * * *`;
  } else if (scheduleType === 'hourly') {
    cronExpression = `0 */${scheduleValue} * * *`;
  } else {
    throw new Error('Invalid schedule type');
  }

  return cronExpression;
};

const startSchedule = (req, res, next) => {
  const { scheduleType, scheduleValue } = req.body;
  if (!jobName) {
    const cronSchedule = convertToCron(scheduleType, scheduleValue);

    jobName = schedule.scheduleJob(cronSchedule, () => {
      updateNewsCache();
    });

    return next(new AppResponse(commonResponseMessages.SCHEDULE_STARTED));
  }

  return next(new AppResponse(commonResponseMessages.SCHEDULE_AL_RUNNING));
};

const stopSchedule = (req, res, next) => {
  if (jobName) {
    jobName.cancel();
    jobName = null;

    return next(new AppResponse(commonResponseMessages.SCHEDULE_STOPPED));
  }

  return next(new AppResponse(commonResponseMessages.SCHEDULE_AL_STOPPED));
};

module.exports = { startSchedule, stopSchedule };
