const { commonResponseMessages, statusMappings } = require('../data/constants');

class AppResponse {
  constructor(message, data = null, statusCode = null) {
    this.message = message;
    this.statusCode = statusCode || this.getStatusCode(message);
    this.status = this.getStatus(this.statusCode);
    this.data = data;
    this.isOperational = true;
  }

  getStatusCode(message) {
    const matchingKey = Object.keys(commonResponseMessages).find(
      (key) => commonResponseMessages[key] === message,
    );

    return matchingKey ? statusMappings[matchingKey] : 500;
  }

  getStatus(statusCode) {
    if (String(statusCode).startsWith('4')) {
      return 'failed';
    }
    if (String(statusCode).startsWith('5')) {
      return 'error';
    }
    return 'success';
  }
}

module.exports = AppResponse;
