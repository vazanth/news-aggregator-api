const AppResponse = require('../helpers/AppResponse');
const { commonResponseMessages } = require('../data/constants');
const schedulerInstance = require('../helpers/scheduler');

const startSchedule = (req, res, next) => {
  const { scheduleType, scheduleValue } = req.body;
  const started = schedulerInstance.startSchedule(scheduleType, scheduleValue);
  if (started) {
    return next(new AppResponse(commonResponseMessages.SCHEDULE_STARTED));
  }

  return next(new AppResponse(commonResponseMessages.SCHEDULE_AL_RUNNING));
};

const stopSchedule = (req, res, next) => {
  const stopped = schedulerInstance.stopSchedule();
  if (stopped) {
    return next(new AppResponse(commonResponseMessages.SCHEDULE_STOPPED));
  }

  return next(new AppResponse(commonResponseMessages.SCHEDULE_AL_STOPPED));
};

module.exports = {
  startSchedule,
  stopSchedule,
};
