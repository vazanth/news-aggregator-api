const cacheManager = require('../helpers/cacheManager');
const catchError = require('../helpers/catchError');
const AppResponse = require('../helpers/AppResponse');
const { fetchAllNews, fetchTopHeadlines } = require('../services/newsService');
const { readFile, writeFile } = require('../helpers/fileOperations');

const getNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;

  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    return next(
      new AppResponse('Fetched Successfully', 200, JSON.parse(cachedNews))
    );
  }

  // fetch data from api and cache it.
  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  return next(new AppResponse('Fetched Successfully', 200, result));
});

const getTopHeadlines = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;

  const cachedNews = cacheManager.get(`${id}-TopNews`);
  if (cachedNews) {
    return next(
      new AppResponse('Fetched Successfully', 200, JSON.parse(cachedNews))
    );
  }

  // fetch data from api and cache it.
  const result = await fetchTopHeadlines(preferences.categories.join(', '));
  cacheManager.set(`${id}-TopNews`, JSON.stringify(result));

  return next(new AppResponse('Fetched Successfully', 200, result));
});

const getReadNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;
  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === id);

  const readArticlesId = currentUser?.articles?.read;

  if (readArticlesId && readArticlesId.length === 0) {
    return next(new AppResponse('No articles are read', 200, null));
  }

  // if available in cache filter and share
  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    const parsedData = JSON.parse(cachedNews);
    const filteredArticles = parsedData.filter((article) =>
      readArticlesId.includes(article.id)
    );
    return next(new AppResponse('Fetched Successfully', 200, filteredArticles));
  }

  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  const filteredArticles = result.filter((article) =>
    readArticlesId.includes(article.id)
  );
  return next(new AppResponse('Fetched Successfully', 200, filteredArticles));
});

const getFavoriteNews = catchError(async (req, res, next) => {
  const { id, preferences } = req.user;
  const userData = await readFile();
  const currentUser = userData.users.find((user) => user.id === id);

  const favoriteArticlesId = currentUser.articles.favorite;

  if (favoriteArticlesId && favoriteArticlesId.length === 0) {
    return next(new AppResponse('No articles are read', 200, null));
  }

  // if available in cache filter and share
  const cachedNews = cacheManager.get(`${id}-AllNews`);
  if (cachedNews) {
    const parsedData = JSON.parse(cachedNews);
    const filteredArticles = parsedData.filter((article) =>
      favoriteArticlesId.includes(article.id)
    );
    return next(new AppResponse('Fetched Successfully', 200, filteredArticles));
  }

  const result = await fetchAllNews(preferences.sources.join(', '));
  cacheManager.set(`${id}-AllNews`, JSON.stringify(result));

  const filteredArticles = result.filter((article) =>
    favoriteArticlesId.includes(article.id)
  );
  return next(new AppResponse('Fetched Successfully', 200, filteredArticles));
});

const markArticleAsRead = catchError(async (req, res, next) => {
  const { newsId } = req.params;
  const { id } = req?.user;
  const userData = await readFile();
  const userIndex = userData.users.findIndex((user) => user.id === id);
  const currentUser = userData.users[userIndex];
  if (!currentUser.articles) {
    currentUser.articles = {
      read: [],
      favorite: [],
    };
  }
  // If the news ID is not already in the read array, add it
  if (!currentUser.articles.read.includes(newsId)) {
    currentUser.articles.read.push(newsId);
  }

  userData.users[userIndex] = currentUser;

  await writeFile(JSON.stringify(userData));

  return next(new AppResponse('Article marked as read', 200));
});

const makeArticleAsFavorite = catchError(async (req, res, next) => {
  const { newsId } = req.params;
  const { id } = req?.user;
  const userData = await readFile();
  const userIndex = userData.users.findIndex((user) => user.id === id);
  const currentUser = userData.users[userIndex];
  if (!currentUser.articles) {
    currentUser.articles = {
      read: [],
      favorite: [],
    };
  }
  // If the news ID is not already in the read array, add it
  if (!currentUser.articles.favorite.includes(newsId)) {
    currentUser.articles.favorite.push(newsId);
  }

  userData.users[userIndex] = currentUser;

  await writeFile(JSON.stringify(userData));

  return next(new AppResponse('Article marked as favorite', 200));
});

module.exports = {
  getNews,
  getTopHeadlines,
  getReadNews,
  getFavoriteNews,
  markArticleAsRead,
  makeArticleAsFavorite,
};
