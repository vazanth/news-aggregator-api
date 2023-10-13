const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const {
  JWT_EXPIRES_IN,
  JWT_SECRET_KEY,
  VERIFICATION_SECRET_KEY,
  VERIFICATION_CODE_EXPIRES_IN,
} = require('../config');
const AppResponse = require('../helpers/AppResponse');
const catchError = require('../helpers/catchError');
const { readFile } = require('../helpers/fileOperations');
const cacheManager = require('../helpers/cacheManager');
const { commonResponseMessages } = require('../data/constants');

const signToken = (user, res, next) => {
  const token = jwt.sign(user, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const { password, ...rest } = user;
  const successResponse = new AppResponse(
    commonResponseMessages.CREATED_SUCCESSFULLY,
    {
      ...rest,
      token,
    }
  );

  // caching the logged-in user for schedulers
  cacheManager.set(`${user.id}-loggedIn`, user.preferences);

  return next(successResponse);
};

const createverificationToken = (user) => {
  const token = jwt.sign(user, VERIFICATION_SECRET_KEY, {
    expiresIn: VERIFICATION_CODE_EXPIRES_IN,
  });
  return token;
};

const verifyConfirmationToken = async (token) => {
  try {
    const decodeToken = await promisify(jwt.verify)(
      token,
      VERIFICATION_SECRET_KEY
    );
    return decodeToken;
  } catch (error) {
    return error.message;
  }
};

const verifyToken = catchError(async (req, res, next) => {
  let token = '';
  if (!req?.headers?.authorization?.startsWith('Bearer')) {
    return next(new AppResponse(commonResponseMessages.NOT_LOGGED_IN));
  }
  token = req.headers.authorization.split(' ')[1];

  //verify token signature
  const decodeToken = await promisify(jwt.verify)(token, JWT_SECRET_KEY);

  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === decodeToken.id);

  if (!currentUser) {
    return next(new AppResponse(commonResponseMessages.NOT_FOUND));
  }

  req.user = currentUser;
  req.userId = currentUser.id;
  next();
});

const restrictTo = (role) => (req, res, next) => {
  if (role !== req.user.role) {
    throw next(new AppResponse(commonResponseMessages.NOT_AUTHORIZED));
  }
  next();
};

module.exports = {
  signToken,
  verifyToken,
  verifyConfirmationToken,
  createverificationToken,
  restrictTo,
};
