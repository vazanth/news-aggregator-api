const schedule = require('node-schedule');
const convertToCron = require('./convertToCron');
const { updateNewsCache } = require('../services/newsService');

class Scheduler {
  constructor() {
    this.scheduledJob = null;
  }

  startSchedule(scheduleType, scheduleValue) {
    if (this.scheduledJob) {
      return false; // Schedule already running
    }

    const cronSchedule = convertToCron(scheduleType, scheduleValue);
    this.scheduledJob = schedule.scheduleJob(cronSchedule, () => {
      updateNewsCache();
    });

    return true; // Schedule started successfully
  }

  stopSchedule() {
    if (this.scheduledJob) {
      this.scheduledJob.cancel();
      this.scheduledJob = null;
      return true; // Schedule stopped successfully
    }

    return false; // No schedule running
  }
}

const schedulerInstance = new Scheduler();

module.exports = schedulerInstance;
