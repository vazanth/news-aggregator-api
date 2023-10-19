const path = require('path');

const filePath = path.join(__dirname, 'tests', 'jest.setup.js');

module.exports = {
  rootDir: 'tests',
  setupFiles: [filePath],
};
