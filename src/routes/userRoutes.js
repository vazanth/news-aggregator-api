const express = require('express');
const {
  signUp,
  signIn,
  signOut,
  getUserPreferences,
  updateUserPreferences,
} = require('../controllers/userController');
const handleValidation = require('../middleware/validateMiddleware');
const {
  validateSignUp,
  validateSignIn,
  validatePreferences,
} = require('../helpers/validator');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up', validateSignUp, handleValidation, signUp);

router.post('/sign-in', validateSignIn, handleValidation, signIn);

// this middleware take's care of protecting routes below this
router.use(verifyToken);

router.post('/sign-out', signOut);

router
  .route('/preferences', validatePreferences)
  .get(getUserPreferences)
  .put(updateUserPreferences);

module.exports = router;
