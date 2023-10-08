const express = require('express');
const { validateNewsParams } = require('../helpers/validator');
const {
  getNews,
  getTopHeadlines,
  getReadNews,
  getFavoriteNews,
  markArticleAsRead,
  makeArticleAsFavorite,
} = require('../controllers/newsController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

router.use(verifyToken);

router.route('/').get(getNews);

router.get('/read', getReadNews);

router.get('/favorite', getFavoriteNews);

router.get('/top-headlines', getTopHeadlines);

router.post('/:newsId/read', validateNewsParams, markArticleAsRead);

router.post('/:newsId/favorite', validateNewsParams, makeArticleAsFavorite);

module.exports = router;
