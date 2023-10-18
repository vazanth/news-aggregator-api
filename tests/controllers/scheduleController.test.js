const convertToCron = require('../../src/helpers/convertToCron');
const {
  startSchedule,
  stopSchedule,
} = require('../../src/controllers/scheduleController');
const { commonResponseMessages } = require('../../src/data/constants');
const AppResponse = require('../../src/helpers/AppResponse');
const schedulerInstance = require('../../src/helpers/scheduler');

describe('convertToCron', () => {
  it('converts daily schedule correctly', () => {
    const cronExpression = convertToCron('daily', '5');
    expect(cronExpression).toBe('0 5 * * *');
  });

  it('converts hourly schedule correctly', () => {
    const cronExpression = convertToCron('hourly', '2');
    expect(cronExpression).toBe('0 */2 * * *');
  });

  it('throws an error for invalid schedule type', () => {
    expect(() => {
      convertToCron('invalidType', '5');
    }).toThrow('Invalid schedule type');
  });
});

describe('Scheduling cron jobs for fetching external API', () => {
  let req = '';
  let next = '';
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        scheduleType: 'hourly',
        scheduleValue: 6,
      },
    };
    next = jest.fn();
  });

  afterEach(() => {
    next = null;
    req = null;
    jest.clearAllMocks();
  });

  it('should start a new schedule if no job is running for hourly', () => {
    schedulerInstance.startSchedule = jest.fn().mockReturnValue(true);
    startSchedule(req, null, next);

    // expect(schedule.scheduleJob).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.SCHEDULE_STARTED)
    );
  });

  it('should start a new schedule if no job is running for daily', () => {
    schedulerInstance.startSchedule = jest.fn().mockReturnValue(true);
    startSchedule(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.SCHEDULE_STARTED)
    );
  });

  it('should throw a error, if schedule is already running', () => {
    schedulerInstance.startSchedule = jest.fn().mockReturnValue(false);
    startSchedule(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.SCHEDULE_AL_RUNNING)
    );
  });
});

describe('Stopping cron jobs upon request', () => {
  let next = '';
  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  afterEach(() => {
    next = null;
    jest.clearAllMocks();
  });

  it('should stop the currently running cron job', () => {
    schedulerInstance.stopSchedule = jest.fn().mockReturnValue(true);

    stopSchedule(null, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.SCHEDULE_STOPPED)
    );
  });

  it('should throw error, if the job is already in stop state', () => {
    schedulerInstance.stopSchedule = jest.fn().mockReturnValue(false);

    stopSchedule(null, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.SCHEDULE_AL_STOPPED)
    );
  });
});
