const AppResponse = require('../helpers/AppResponse');
const { commonResponseMessages } = require('../data/constants');

const sendResponse = (result, res) => {
  if (result?.isOperational) {
    // Trusted resultors that we know
    res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } else {
    res.status(500).json({
      // Unknown errors
      status: 'error',
      message: 'Something Went Wrong!!',
    });
  }
};

const handleJWTError = () => new AppResponse(commonResponseMessages.INVALID_TOKEN);

const handleJWTExpiredError = () => new AppResponse(commonResponseMessages.EXPIRED_TOKEN);

const responseMiddleware = (result, req, res, next) => {
  let response = result;
  if (response instanceof AppResponse) {
    sendResponse(response, res);
    return;
  }
  if (result?.message === 'jwt expired') {
    response = handleJWTExpiredError();
  }
  if (result?.message === 'invalid token' || result?.message === 'invalid signature') {
    response = handleJWTError();
  }

  sendResponse(response, res);
};

module.exports = responseMiddleware;
