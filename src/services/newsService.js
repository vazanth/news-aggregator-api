const axios = require('axios');
const cacheManager = require('../helpers/cacheManager');
const { NEWS_API_KEY } = require('../config');
const AppResponse = require('../helpers/AppResponse');
const fetchAllNews = async (params) => {
  const options = {
    method: 'GET',
    url: `https://newsapi.org/v2/everything?sources=${params}`,
    headers: {
      'X-Api-Key': NEWS_API_KEY,
    },
  };

  try {
    const result = await axios.request(options);
    return result.data.articles.map((item, index) => ({
      ...item,
      id: `AllNews-${index}`,
    }));
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error.message;
    const statusCode = error?.response?.status || 500;
    throw new AppResponse(errorMessage, null, statusCode);
  }
};

const fetchTopHeadlines = async (params) => {
  const options = {
    method: 'GET',
    url: `https://newsapi.org/v2/top-headlines?category=${params}`,
    headers: {
      'X-Api-Key': NEWS_API_KEY,
    },
  };

  try {
    const result = await axios.request(options);
    return result.data.articles;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error.message;
    const statusCode = error?.response?.status || 500;
    throw new AppResponse(errorMessage, null, statusCode);
  }
};

const updateNewsCache = async () => {
  const pattern = /-loggedIn$/;
  const keysOfCache = cacheManager.keys();

  const matchedKeys = keysOfCache.filter((key) => pattern.test(key));

  const matchedData = cacheManager.mget(matchedKeys);

  if (matchedData) {
    Object.keys(matchedData).forEach(async (item) => {
      const preferences = matchedData[item];
      const allNews = await fetchAllNews(preferences.sources.join(', '));
      const topNews = await fetchTopHeadlines(
        preferences.categories.join(', ')
      );
      const actualId = item.replace('-loggedIn', '');
      cacheManager.set(`${actualId}-AllNews`, JSON.stringify(allNews));
      cacheManager.set(`${actualId}-TopNews`, JSON.stringify(topNews));
      console.log('News cache updated.');
    });
  } else {
    console.log('No active users to update cache.');
  }
};

module.exports = {
  updateNewsCache,
  fetchAllNews,
  fetchTopHeadlines,
};
