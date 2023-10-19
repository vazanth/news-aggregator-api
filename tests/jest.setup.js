jest.mock('../src/helpers/cacheManager', () => ({
  get: jest.fn(),
  set: jest.fn(),
  mget: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../src/helpers/fileOperations', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('../src/services/newsService', () => ({
  fetchAllNews: jest.fn(),
  fetchTopHeadlines: jest.fn(),
}));
