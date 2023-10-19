const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const { signToken, createverificationToken, verifyConfirmationToken } = require('./authController');
const catchError = require('../helpers/catchError');
const AppResponse = require('../helpers/AppResponse');
const { writeFile, readFile } = require('../helpers/fileOperations');
const cacheManager = require('../helpers/cacheManager');
const { commonResponseMessages } = require('../data/constants');
const Email = require('../services/emailService');

const signUp = catchError(async (req, res, next) => {
  const { fullname, email, password, preferences, role } = req.body;
  const userData = await readFile();
  if (userData.users.find((user) => user.email === email)) {
    throw new AppResponse(commonResponseMessages.EMAIL_EXIST);
  }
  const hashedPassword = await argon2.hash(password);
  const activationToken = createverificationToken({ email, fullname });

  const payload = {
    id: uuidv4(),
    fullname,
    email,
    role: role || 'user',
    password: hashedPassword,
    preferences,
    activationToken,
    isActive: false,
  };
  userData.users.push(payload);
  await writeFile(JSON.stringify(userData));
  const url = `${req.protocol}://${req.get('host')}/api/users/confirm-user/${activationToken}`;
  await new Email({ fullname, email }, url).sendConfirmation();
  return next(new AppResponse(commonResponseMessages.REGISTERED_SUCCESSFULLY));
});

const signIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;
  const userData = await readFile();
  const user = userData.users.find((userDetail) => userDetail.email === email);
  if (!user) {
    throw new AppResponse(commonResponseMessages.AUTH_INCORRECT);
  }
  const isPasswordMatch = await argon2.verify(user.password, password);
  if (!isPasswordMatch) {
    throw new AppResponse(commonResponseMessages.AUTH_INCORRECT);
  }
  signToken(user, res, next);
});

const signOut = (req, res, next) => {
  const { userId } = req;
  cacheManager.delete(`${userId}-loggedIn`);
  return next(new AppResponse(commonResponseMessages.LOGGED_OUT));
};

const confirmUser = catchError(async (req, res, next) => {
  const { token } = req.params;
  const userData = await readFile();
  // verify if token is expired
  const result = await verifyConfirmationToken(token);

  if (result === 'jwt expired') {
    return next(new AppResponse(commonResponseMessages.EXPIRED_TOKEN));
  }

  const userIndex = userData.users.findIndex((user) => user.email === result.email);

  if (userIndex === -1) {
    return next(new AppResponse(commonResponseMessages.NOT_FOUND));
  }

  delete userData.users[userIndex].activationToken;

  userData.users[userIndex].isActive = true;

  const { fullname } = userData.users[userIndex];
  const { email } = userData.users[userIndex];

  await writeFile(JSON.stringify(userData));
  await new Email({ fullname, email }, '').sendWelcome();
  return next(new AppResponse(commonResponseMessages.CONFIRMED_USER));
});

const getUserPreferences = catchError(async (req, res, next) => {
  const { userId } = req;
  const result = await readFile();
  const currentUserPrefences = result.users.find((user) => user.id === userId)?.preferences;

  next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, currentUserPrefences));
});

const updateUserPreferences = catchError(async (req, res, next) => {
  const { userId } = req;
  const preferences = req.body;

  const result = await readFile();
  const userIndex = result.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new AppResponse(commonResponseMessages.NOT_FOUND);
  }

  result.users[userIndex].preferences = preferences;

  await writeFile(JSON.stringify(result));
  return next(new AppResponse(commonResponseMessages.UPDATED_SUCCESSFULLY));
});

module.exports = {
  signUp,
  signIn,
  getUserPreferences,
  updateUserPreferences,
  signOut,
  confirmUser,
};
