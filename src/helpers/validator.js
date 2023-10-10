const { body, param } = require('express-validator');
const { categories, sources, roles } = require('../data/constants');

const validateSignUp = [
  body('fullname')
    .notEmpty()
    .isString()
    .withMessage('Full name is required and should be a string')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isStrongPassword()
    .withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('role').custom((value) => {
    if (!value) {
      return true;
    }
    if (!roles.includes(value?.toLowerCase())) {
      throw new Error('not a valid role, it can be either user or admin');
    }
    return true;
  }),
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object')
    .bail() // Stops executing validators if preferences is not an object
    .custom((preferences, { req }) => {
      if (!preferences || Object.keys(preferences).length === 0) {
        throw new Error('Preferences object is required');
      }

      if (
        preferences.categories.length === 0 ||
        preferences.sources.length === 0
      ) {
        throw new Error(
          'Preferences object should have categories and sources'
        );
      }

      const validCategories = categories;
      const validSources = sources;

      // Validate categories property
      if (preferences.categories) {
        if (preferences.categories.length > 1) {
          throw new Error('Cannot have more than one category');
        }

        const invalidCategories = preferences.categories.filter(
          (category) => !validCategories.includes(category)
        );
        if (invalidCategories.length > 0) {
          throw new Error(
            `Invalid categories: ${invalidCategories.join(', ')}`
          );
        }
      }

      // Validate sources property
      if (preferences.sources) {
        const invalidSources = preferences.sources.filter(
          (source) => !validSources.includes(source)
        );
        if (invalidSources.length > 0) {
          throw new Error(`Invalid sources: ${invalidSources.join(', ')}`);
        }
      }

      // All checks passed
      return true;
    }),
];

const validateSignIn = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validatePreferences = [
  body('categories')
    .isArray()
    .withMessage('categories cannot be empty')
    .isString()
    .withMessage('values must be strings')
    .custom((value) => {
      if (value.length > 1) {
        throw new Error('Cannot have more than one category');
      }

      const invalidCategories = value.categories.filter(
        (category) => !categories.includes(category)
      );
      if (invalidCategories.length > 0) {
        throw new Error(`Invalid categories: ${invalidCategories.join(', ')}`);
      }
      return true;
    }),

  body('sources')
    .isArray()
    .withMessage('sources cannot be empty')
    .isString()
    .withMessage('values must be strings')
    .custom((value) => {
      const invalidSources = value.sources.filter(
        (category) => !sources.includes(category)
      );
      if (invalidSources.length > 0) {
        throw new Error(`Invalid categories: ${invalidSources.join(', ')}`);
      }
      return true;
    }),
];

const validateNewsParams = [
  param('newsId').isAlphanumeric().withMessage('param ID must be alphanumeric'),
];

const validateSchedule = [
  body('scheduleType')
    .isString()
    .notEmpty()
    .withMessage('schedule type cannot be empty')
    .isIn(['hourly', 'daily'])
    .withMessage('Invalid scheduleType, values can be either hourly or daily'),
  body('scheduleValue')
    .notEmpty()
    .withMessage('schedule value cannot be empty')
    .custom((value, { req }) => {
      const { scheduleType } = req.body;
      if (scheduleType === 'hourly' && (value < 0 || value > 6)) {
        throw new Error('Hourly schedule value must be between 0 and 6.');
      }
      if (scheduleType === 'daily' && (value < 0 || value > 23)) {
        throw new Error('Daily schedule value must be between 0 and 23.');
      }
      return true;
    }),
];

module.exports = {
  validateSignUp,
  validateSignIn,
  validatePreferences,
  validateNewsParams,
  validateSchedule,
};
