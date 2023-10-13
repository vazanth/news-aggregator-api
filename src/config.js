const dotenv = require('dotenv');
const path = require('path');

const envpath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envpath });

module.exports = process.env;
