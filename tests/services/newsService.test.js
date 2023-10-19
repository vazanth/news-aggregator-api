// unmocking the common mock has this is the core test file so calling the fn directly
jest.unmock('../../src/services/newsService');
jest.resetModules();

jest.mock('axios');

const axios = require('axios');
const {
  fetchAllNews,
  fetchTopHeadlines,
} = require('../../src/services/newsService');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('News Service API ', () => {
  it('should return data on successful API call', async () => {
    const responseData = {
      articles: [{ title: 'News 1' }, { title: 'News 2' }],
    };
    axios.request.mockResolvedValue({ data: responseData });

    const result = await fetchAllNews('abc-news');

    expect(result).toEqual([
      { title: 'News 1', id: 'AllNews-0' },
      { title: 'News 2', id: 'AllNews-1' },
    ]);
  });

  it('should throw error on unsuccessful API call', async () => {
    axios.request.mockRejectedValue({
      response: {
        data: {
          message: 'Api Request Failed',
        },
        status: 500,
      },
    });

    await expect(fetchAllNews('source')).rejects.toMatchObject({
      message: 'Api Request Failed',
      statusCode: 500,
    });
  });
});

describe('News Service API - Top Headlines', () => {
  it('should return data on successful API call', async () => {
    const responseData = {
      articles: [{ title: 'News 1' }, { title: 'News 2' }],
    };
    axios.request.mockResolvedValue({ data: responseData });

    const result = await fetchTopHeadlines('abc-news');

    expect(result).toEqual([
      { title: 'News 1', id: 'TopNews-0' },
      { title: 'News 2', id: 'TopNews-1' },
    ]);
  });

  it('should throw error on unsuccessful API call', async () => {
    axios.request.mockRejectedValue({
      response: {
        data: {
          message: 'Api Request Failed',
        },
        status: 500,
      },
    });

    await expect(fetchTopHeadlines('source')).rejects.toMatchObject({
      message: 'Api Request Failed',
      statusCode: 500,
    });
  });
});
