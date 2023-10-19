const { fetchAllNews, fetchTopHeadlines } = require('./newsService');
const cacheManager = require('../helpers/cacheManager');
const logger = require('./loggerService');

const updateNewsCache = async () => {
  const pattern = /-loggedIn$/;
  const keysOfCache = cacheManager.keys();

  const matchedKeys = keysOfCache.filter((key) => pattern.test(key));

  const matchedData = cacheManager.mget(matchedKeys);

  if (matchedData) {
    await Promise.all(
      Object.entries(matchedData).map(async ([item, preferences]) => {
        const actualId = item.replace('-loggedIn', '');
        const [allNews, topNews] = await Promise.all([
          fetchAllNews(preferences.sources.join(', ')),
          fetchTopHeadlines(preferences.categories.join(', ')),
        ]);
        cacheManager.set(`${actualId}-AllNews`, JSON.stringify(allNews));
        cacheManager.set(`${actualId}-TopNews`, JSON.stringify(topNews));
      }),
    );
    // eslint-disable-next-line no-console
    logger.info('News cache updated.');
  } else {
    // eslint-disable-next-line no-console
    logger.info('No active users to update cache.');
  }
};

module.exports = updateNewsCache;
