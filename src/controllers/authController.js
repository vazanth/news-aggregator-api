const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { JWT_EXPIRES_IN, JWT_SECRET_KEY } = require('../config');
const AppResponse = require('../helpers/AppResponse');
const catchError = require('../helpers/catchError');
const { readFile } = require('../helpers/fileOperations');
const cacheManager = require('../helpers/cacheManager');

const signToken = (user, res, next) => {
  const token = jwt.sign(user, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const { password, ...rest } = user;
  const successResponse = new AppResponse('Request successful', 200, {
    ...rest,
    token,
  });

  // caching the logged-in user for schedulers
  cacheManager.set(`${user.id}-loggedIn`, user.preferences);

  return next(successResponse);
};

const verifyToken = catchError(async (req, res, next) => {
  let token = '';
  if (!req?.headers?.authorization?.startsWith('Bearer')) {
    return next(new AppResponse('User not logged in, Please login!!', 401));
  }
  token = req.headers.authorization.split(' ')[1];

  //verify token signature
  const decodeToken = await promisify(jwt.verify)(token, JWT_SECRET_KEY);

  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === decodeToken.id);

  if (!currentUser) {
    return next(
      new AppResponse('User Belong to this token does not exist anymore', 401)
    );
  }

  req.user = currentUser;
  req.userId = currentUser.id;
  next();
});

const restrictTo = (role) => (req, res, next) => {
  if (role !== req.user.role) {
    throw next(
      new AppResponse("You don't have access to perform this action", 403)
    );
  }
  next();
};

module.exports = { signToken, verifyToken, restrictTo };
