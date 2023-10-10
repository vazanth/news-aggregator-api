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
    for (var key in commonResponseMessages) {
      if (commonResponseMessages[key] === message) {
        return statusMappings[key];
      }
    }
    return 500; // no match found then 500
  }

  getStatus(statusCode) {
    if (String(statusCode).startsWith('4')) {
      return 'failed';
    } else if (String(statusCode).startsWith('5')) {
      return 'error';
    } else {
      return 'success';
    }
  }
}

module.exports = AppResponse;
