const { validationResult } = require('express-validator');
const AppResponse = require('../helpers/AppResponse');

const handleSignUpValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const invalidFields = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new AppResponse(invalidFields, 400));
  }
  next();
};

const handleSignInValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const invalidFields = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new AppResponse(invalidFields, 400));
  }
  next();
};

module.exports = { handleSignUpValidation, handleSignInValidation };
