const cacheManager = require('../../src/helpers/cacheManager');
const updateNewsCache = require('../../src/services/newsCacheService');
const {
  fetchAllNews,
  fetchTopHeadlines,
} = require('../../src/services/newsService');
const dummyNewsData = require('../controllers/newsData.test.json');

describe('Verify if the data from external api is set in cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  jest.spyOn(console, 'log').mockImplementation();
  it('should store the external api data to cache for logged-in users', async () => {
    cacheManager.keys.mockReturnValue([
      '123-loggedIn',
      'fileIo',
      '234-loggedIn',
    ]);

    cacheManager.mget.mockReturnValue({
      '123-loggedIn': {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
      '234-loggedIn': {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
    });

    cacheManager.set.mockReturnValue(
      `123-loggedIn-AllNews`,
      JSON.stringify(dummyNewsData)
    );
    cacheManager.set.mockReturnValue(
      `123-loggedIn-TopNews`,
      JSON.stringify(dummyNewsData)
    );

    fetchAllNews.mockResolvedValue(dummyNewsData);
    fetchTopHeadlines.mockResolvedValue(dummyNewsData);

    await updateNewsCache();

    expect(console.log).toHaveBeenCalledWith('News cache updated.');
  });

  it('should not cache any data and log the appropriate message to console', async () => {
    cacheManager.keys.mockReturnValue([]);

    cacheManager.mget.mockReturnValue(null);

    await updateNewsCache();

    expect(console.log).toHaveBeenCalledWith(
      'No active users to update cache.'
    );
  });
});
