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

module.exports = convertToCron;
