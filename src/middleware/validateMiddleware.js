const { validationResult } = require('express-validator');
const AppResponse = require('../helpers/AppResponse');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const invalidFields = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new AppResponse(invalidFields, null, 400));
  }
  next();
};

module.exports = handleValidation;
