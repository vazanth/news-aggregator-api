class AppResponse {
  constructor(message, statusCode, data = null) {
    // super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.status = this.getStatus(statusCode);
    this.data = data;
    this.isOperational = true;
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
