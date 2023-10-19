const path = require('path');

const filePath = path.join(__dirname, 'tests', 'jest.setup.js');

module.exports = {
  rootDir: 'tests',
  setupFiles: [filePath],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
