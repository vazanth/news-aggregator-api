beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

const {
  getNews,
  getTopHeadlines,
  getReadNews,
  getFavoriteNews,
  markArticleAsRead,
  makeArticleAsFavorite,
} = require('../../src/controllers/newsController');
const { commonResponseMessages } = require('../../src/data/constants');
const AppResponse = require('../../src/helpers/AppResponse');
const cacheManager = require('../../src/helpers/cacheManager');
const { readFile, writeFile } = require('../../src/helpers/fileOperations');
const {
  fetchAllNews,
  fetchTopHeadlines,
} = require('../../src/services/newsService');
const dummyNewsData = require('./newsData.test.json');

let req = '';
let newsData = '';
let next = '';
let userInfo = '';

beforeEach(() => {
  next = jest.fn();
  jest.mock('../../src/controllers/newsController', () => ({
    get: jest.fn(),
    set: jest.fn(),
  }));
  req = {
    params: {
      newsId: 'AllNews-6',
    },
    user: {
      id: 'user123',
      preferences: {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
    },
  };

  userInfo = {
    id: 'user123',
    preferences: {
      categories: ['technology'],
      sources: ['abc-news', 'bbc-news'],
    },
    articles: { read: ['AllNews-1'], favorite: ['AllNews-3'] },
  };

  newsData = JSON.stringify(dummyNewsData);
});

afterEach(() => {
  req = null;
  newsData = null;
  jest.clearAllMocks();
});

describe('Fetching All news from external API', () => {
  it('should return cached news data if available in cache', async () => {
    // setting a dummy data to my mocked cache manager
    cacheManager.get.mockReturnValue(newsData);

    await getNews(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(
        commonResponseMessages.FETCHED_SUCCESSFULLY,
        JSON.parse(newsData)
      )
    );
  });

  it('should call external api, if data is not in cache', async () => {
    cacheManager.get.mockReturnValue(null); // mocking it has nothing in cache
    cacheManager.set.mockReturnValue(`${req.user.id}-AllNews`, newsData);

    fetchAllNews.mockResolvedValue(newsData);

    await getNews(req, null, next);

    expect(cacheManager.set).toHaveBeenCalledWith(
      `${req.user.id}-AllNews`,
      JSON.stringify(newsData)
    );

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, newsData)
    );
  });
});

describe('Fetching Top news from external API', () => {
  beforeEach(() => {
    jest.mock('../../src/controllers/newsController', () => ({
      get: jest.fn(),
      set: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached news data if available in cache', async () => {
    cacheManager.get.mockReturnValue(newsData);

    await getTopHeadlines(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(
        commonResponseMessages.FETCHED_SUCCESSFULLY,
        JSON.parse(newsData)
      )
    );
  });

  it('should call external api, if data is not in cache', async () => {
    cacheManager.get.mockReturnValue(null); // mocking it has nothing in cache
    cacheManager.set.mockReturnValue(`${req.user.id}-TopNews`, newsData);

    fetchTopHeadlines.mockResolvedValue(newsData);

    await getTopHeadlines(req, null, next);

    expect(cacheManager.set).toHaveBeenCalledWith(
      `${req.user.id}-TopNews`,
      JSON.stringify(newsData)
    );

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, newsData)
    );
  });
});

describe('Fetching the user read news from in-memory data', () => {
  it('should throw no data found message if user has not read any article ', async () => {
    // setting the read to empty, to check for a no data found response
    userInfo.articles.read = [];
    await readFile.mockResolvedValue({ users: [userInfo] });

    await getReadNews(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NO_DATA_FOUND, null)
    );
  });

  it('should return user read articles from cache, if article data is available in cache', async () => {
    await readFile.mockResolvedValue({ users: [userInfo] });

    cacheManager.get.mockReturnValue(newsData);
    await getReadNews(req, null, next);

    const result = JSON.parse(newsData)[1];

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, [result])
    );
  });

  it('should retun user read articles via external api, if the data is not cached', async () => {
    cacheManager.get.mockReturnValue(null); // mocking it has nothing in cache
    cacheManager.set.mockReturnValue(`${req.user.id}-AllNews`, newsData);

    fetchAllNews.mockResolvedValue(JSON.parse(newsData));

    await getReadNews(req, null, next);

    expect(cacheManager.set).toHaveBeenCalledWith(
      `${req.user.id}-AllNews`,
      newsData
    );

    const result = JSON.parse(newsData)[1];

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, [result])
    );
  });
});

describe('Fetching the user favorite news from in-memory data', () => {
  it('should throw no data found message if user has not marker any article has favorite', async () => {
    // setting the favorite to empty, to check for a no data found response
    userInfo.articles.favorite = [];
    await readFile.mockResolvedValue({ users: [userInfo] });

    await getFavoriteNews(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NO_DATA_FOUND, null)
    );
  });

  it('should return user favorite articles from cache, if favorited article data is available in cache', async () => {
    await readFile.mockResolvedValue({ users: [userInfo] });

    cacheManager.get.mockReturnValue(newsData);
    await getFavoriteNews(req, null, next);

    const result = JSON.parse(newsData)[2];

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, [result])
    );
  });

  it('should retun user read articles via external api, if the data is not cached', async () => {
    cacheManager.get.mockReturnValue(null); // mocking it has nothing in cache
    cacheManager.set.mockReturnValue(`${req.user.id}-AllNews`, newsData);

    fetchAllNews.mockResolvedValue(JSON.parse(newsData));

    await getFavoriteNews(req, null, next);

    expect(cacheManager.set).toHaveBeenCalledWith(
      `${req.user.id}-AllNews`,
      newsData
    );

    const result = JSON.parse(newsData)[2];

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, [result])
    );
  });
});

describe('Mark a article as read by the user', () => {
  it('should write the articleId, into the file, if it was not marked as read earlier', async () => {
    await readFile.mockResolvedValue({ users: [userInfo] });
    await writeFile.mockResolvedValue();
    await markArticleAsRead(req, null, next);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY)
    );
  });

  it('should not write the articleId into the file, if it already exists', async () => {
    userInfo.articles.read = ['AllNews-6'];
    await readFile.mockResolvedValue({ users: [userInfo] });
    await markArticleAsRead(req, null, next);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.ARTICLE_EXIST)
    );
    expect(writeFile).not.toHaveBeenCalled();
  });
});

describe('Mark a article as favorite by the user', () => {
  it('should write the articleId, into the file, if it was not marked as favorite earlier', async () => {
    await readFile.mockResolvedValue({ users: [userInfo] });
    await writeFile.mockResolvedValue();
    await makeArticleAsFavorite(req, null, next);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY)
    );
  });

  it('should not write the articleId into the file, if it already exists', async () => {
    userInfo.articles.favorite = ['AllNews-6'];
    await readFile.mockResolvedValue({ users: [userInfo] });
    await makeArticleAsFavorite(req, null, next);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.ARTICLE_EXIST)
    );
    expect(writeFile).not.toHaveBeenCalled();
  });
});
