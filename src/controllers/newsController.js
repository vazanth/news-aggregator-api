const cacheManager = require('../helpers/cacheManager');
const catchError = require('../helpers/catchError');
const AppResponse = require('../helpers/AppResponse');
const { fetchAllNews, fetchTopHeadlines } = require('../services/newsService');
const { readFile, writeFile } = require('../helpers/fileOperations');
const { commonResponseMessages } = require('../data/constants');

const getNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;

  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    return next(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, JSON.parse(cachedNews)),
    );
  }

  // fetch data from api and cache it.
  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, result));
});

const getTopHeadlines = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;

  const cachedNews = cacheManager.get(`${id}-TopNews`);
  if (cachedNews) {
    return next(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, JSON.parse(cachedNews)),
    );
  }

  // fetch data from api and cache it.
  const result = await fetchTopHeadlines(preferences.categories.join(', '));
  cacheManager.set(`${id}-TopNews`, JSON.stringify(result));

  return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, result));
});

const getReadNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;
  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === id);

  const readArticlesId = currentUser?.articles?.read;

  if (!readArticlesId || readArticlesId?.length === 0) {
    return next(new AppResponse(commonResponseMessages.NO_DATA_FOUND, null));
  }

  // if available in cache filter and share
  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    const parsedData = JSON.parse(cachedNews);
    const filteredArticles = parsedData.filter((article) => readArticlesId.includes(article.id));
    return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, filteredArticles));
  }

  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  const filteredArticles = result.filter((article) => readArticlesId.includes(article.id));
  return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, filteredArticles));
});

const getFavoriteNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;
  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === id);

  const favoriteArticlesId = currentUser?.articles?.favorite;

  if (!favoriteArticlesId || favoriteArticlesId?.length === 0) {
    return next(new AppResponse(commonResponseMessages.NO_DATA_FOUND));
  }

  // if available in cache filter and share
  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    const parsedData = JSON.parse(cachedNews);
    const filteredArticles = parsedData.filter((article) =>
      favoriteArticlesId.includes(article.id),
    );
    return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, filteredArticles));
  }

  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  const filteredArticles = result.filter((article) => favoriteArticlesId.includes(article.id));
  return next(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, filteredArticles));
});

const markArticleAsRead = catchError(async (req, res, next) => {
  const { newsId } = req.params;
  const { id } = req.user;
  const userData = await readFile();
  const userIndex = userData.users.findIndex((user) => user.id === id);
  const currentUser = userData.users[userIndex];
  if (!currentUser.articles) {
    currentUser.articles = {
      read: [],
      favorite: [],
    };
  }
  // If the news ID is already in the read array, throw back a response
  if (currentUser.articles.read.includes(newsId)) {
    return next(new AppResponse(commonResponseMessages.ARTICLE_EXIST));
  }
  currentUser.articles.read.push(newsId);

  userData.users[userIndex] = currentUser;

  await writeFile(JSON.stringify(userData));

  return next(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
});

const makeArticleAsFavorite = catchError(async (req, res, next) => {
  const { newsId } = req.params;
  const { id } = req.user;
  const userData = await readFile();
  const userIndex = userData.users.findIndex((user) => user.id === id);
  const currentUser = userData.users[userIndex];
  if (!currentUser.articles) {
    currentUser.articles = {
      read: [],
      favorite: [],
    };
  }
  // If the news ID is not already in the favorite array, throw back response
  if (currentUser.articles.favorite.includes(newsId)) {
    return next(new AppResponse(commonResponseMessages.ARTICLE_EXIST));
  }

  userData.users[userIndex] = currentUser;

  await writeFile(JSON.stringify(userData));

  return next(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
});

module.exports = {
  getNews,
  getTopHeadlines,
  getReadNews,
  getFavoriteNews,
  markArticleAsRead,
  makeArticleAsFavorite,
};
