jest.mock('../../src/helpers/convertToCron');

const schedulerInstance = require('../../src/helpers/scheduler');
const convertToCron = require('../../src/helpers/convertToCron');

describe('Verify the scheduler class methods', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true, upon succesfull start of cron job', () => {
    const scheduleType = 'daily';
    const scheduleValue = 6;

    convertToCron.mockReturnValue('0 6 * * *'); // mocking covertToCron functionality

    const result = schedulerInstance.startSchedule(scheduleType, scheduleValue);

    expect(result).toBe(true);
    expect(convertToCron).toHaveBeenCalledWith(scheduleType, scheduleValue);

    schedulerInstance.stopSchedule();
  });

  it('should return false, if job is already running', () => {
    const scheduleType = 'daily';
    const scheduleValue = 6;

    convertToCron.mockReturnValue('0 6 * * *');

    schedulerInstance.startSchedule(scheduleType, scheduleValue);
    const result = schedulerInstance.startSchedule(scheduleType, scheduleValue);

    expect(result).toBe(false);
    expect(convertToCron).toHaveBeenCalledWith(scheduleType, scheduleValue);

    schedulerInstance.stopSchedule();
  });

  it('should stop the schedule successfully', () => {
    schedulerInstance.startSchedule('someType', 6);

    const result = schedulerInstance.stopSchedule();

    expect(result).toBe(true); // Ensure the method returns true for successful schedule stopping
  });

  it('should stop the schedule successfully', () => {
    const result = schedulerInstance.stopSchedule();

    expect(result).toBe(false); // Ensure the method returns true for successful schedule stopping
  });
});
