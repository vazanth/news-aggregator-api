const dotenv = require('dotenv');
const path = require('path');

const envpath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envpath });

module.exports = {
  SERVER_PORT: process.env.PORT,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
};
