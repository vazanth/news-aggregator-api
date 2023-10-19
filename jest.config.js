const path = require('path');

const filePath = path.join(__dirname, 'tests', 'jest.setup.js');

module.exports = {
  rootDir: 'tests',
  setupFiles: [filePath],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
