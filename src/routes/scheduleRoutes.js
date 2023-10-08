const express = require('express');
const {
  startSchedule,
  stopSchedule,
} = require('../controllers/scheduleController');
const { verifyToken, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(verifyToken);

router.post('/start', restrictTo('admin'), startSchedule);

router.post('/stop', restrictTo('admin'), stopSchedule);

module.exports = router;
