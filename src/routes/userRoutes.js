const express = require('express');
const {
  signUp,
  signIn,
  signOut,
  getUserPreferences,
  updateUserPreferences,
} = require('../controllers/userController');
const {
  handleSignUpValidation,
  handleSignInValidation,
} = require('../middleware/userMiddleware');
const {
  validateSignUp,
  validateSignIn,
  validatePreferences,
} = require('../helpers/validator');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up', validateSignUp, handleSignUpValidation, signUp);

router.post('/sign-in', validateSignIn, handleSignInValidation, signIn);

// this middleware take's care of protecting routes below this
router.use(verifyToken);

router.post('/sign-out', signOut);

router
  .route('/preferences', validatePreferences)
  .get(getUserPreferences)
  .put(updateUserPreferences);

module.exports = router;
