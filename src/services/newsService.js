const axios = require('axios');
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
    return result.data.articles.map((item, index) => ({
      ...item,
      id: `TopNews-${index}`,
    }));
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error.message;
    const statusCode = error?.response?.status || 500;
    throw new AppResponse(errorMessage, null, statusCode);
  }
};

module.exports = {
  fetchAllNews,
  fetchTopHeadlines,
};
