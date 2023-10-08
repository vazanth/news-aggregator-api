const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const { signToken } = require('./authController');
const catchError = require('../helpers/catchError');
const AppResponse = require('../helpers/AppResponse');
const { writeFile, readFile } = require('../helpers/fileOperations');
const cacheManager = require('../helpers/cacheManager');

const signUp = catchError(async (req, res, next) => {
  const { fullname, email, password, preferences, role } = req.body;
  const userData = await readFile();
  if (userData.users.find((user) => user.email === email)) {
    throw new AppResponse('email already exist', 400);
  }
  const hashedPassword = await argon2.hash(password);
  const payload = {
    id: uuidv4(),
    fullname,
    email,
    role: role || 'user',
    password: hashedPassword,
    preferences,
  };
  userData.users.push(payload);
  await writeFile(JSON.stringify(userData));
  return next(new AppResponse('registered successfully', 201));
});

const signIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;
  const userData = await readFile();
  const user = userData.users.find((user) => user.email === email);
  if (!user) {
    throw new AppResponse('email id or password incorrect', 500);
  }
  const isPasswordMatch = await argon2.verify(user.password, password);
  if (!isPasswordMatch) {
    throw new AppResponse('email id or password incorrect', 500);
  }
  signToken(user, res, next);
});

const signOut = (req, res, next) => {
  let userId = req.userId;
  cacheManager.delete(`${userId}-loggedIn`);
  return next(new AppResponse('Logged out succesfully', 200));
};

const getUserPreferences = catchError(async (req, res, next) => {
  let userId = req.userId;
  const result = await readFile();
  const currentUserPrefences = result.users.find(
    (user) => user.id === userId
  )?.preferences;

  next(new AppResponse('Fetched successfully', 200, currentUserPrefences));
});

const updateUserPreferences = catchError(async (req, res, next) => {
  let userId = req.userId;
  const preferences = req.body;

  const result = await readFile();
  const userIndex = result.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new AppResponse('user data not found', 500);
  }

  result.users[userIndex].preferences = preferences;

  await writeFile(JSON.stringify(result));
  return next(new AppResponse('updated successfully', 201));
});

module.exports = {
  signUp,
  signIn,
  getUserPreferences,
  updateUserPreferences,
  signOut,
};
