const AppResponse = require('../helpers/AppResponse');

const sendResponse = (result, res) => {
  if (result.isOperational) {
    //Trusted resultors that we know
    res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } else {
    res.status(500).json({
      //Unknown errors
      status: 'error',
      message: 'Something Went Wrong!!',
    });
  }
};

const handleJWTError = () =>
  new AppResponse('Invalid Token Please login again!!', 401);

const handleJWTExpiredError = () =>
  new AppResponse('Token Expired, Please login again!!', 401, null);

const responseMiddleware = (result, req, res, next) => {
  if (result instanceof AppResponse) {
    sendResponse(result, res);
    return;
  } else if (result.message === 'jwt expired') {
    result = handleJWTExpiredError();
  } else if (result.message === 'invalid token') {
    result = handleJWTError();
  }

  sendResponse(result, res);
};

module.exports = responseMiddleware;
