const { fetchAllNews, fetchTopHeadlines } = require('./newsService');
const cacheManager = require('../helpers/cacheManager');

const updateNewsCache = async () => {
  const pattern = /-loggedIn$/;
  const keysOfCache = cacheManager.keys();

  const matchedKeys = keysOfCache.filter((key) => pattern.test(key));

  const matchedData = cacheManager.mget(matchedKeys);

  if (matchedData) {
    const keys = Object.keys(matchedData);
    for (const item of keys) {
      const preferences = matchedData[item];
      const allNews = await fetchAllNews(preferences.sources.join(', '));
      const topNews = await fetchTopHeadlines(
        preferences.categories.join(', ')
      );
      const actualId = item.replace('-loggedIn', '');
      cacheManager.set(`${actualId}-AllNews`, JSON.stringify(allNews));
      cacheManager.set(`${actualId}-TopNews`, JSON.stringify(topNews));
      console.log('News cache updated.');
    }
  } else {
    console.log('No active users to update cache.');
  }
};

module.exports = updateNewsCache;
