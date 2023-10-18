const responseMiddleware = require('../../src/middleware/responseMiddleware');
const AppResponse = require('../../src/helpers/AppResponse');
const { commonResponseMessages } = require('../../src/data/constants');

describe('responseMiddleware', () => {
  it('should send AppResponse object as response', () => {
    const appResponse = new AppResponse(
      commonResponseMessages.FETCHED_SUCCESSFULLY,
      { data: 'some data' }
    );
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(appResponse, {}, res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Fetched successfully',
        status: 'success',
        data: { data: 'some data' },
      })
    );
  });

  it('should send AppResponse object for expired token', () => {
    const expiredTokenResponse = new AppResponse(
      commonResponseMessages.EXPIRED_TOKEN
    );
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(expiredTokenResponse, {}, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token Expired, Please login again!!',
        status: 'failed',
        data: null,
      })
    );
  });

  it('should send AppResponse object for invalid token', () => {
    const invalidTokenResponse = new AppResponse(
      commonResponseMessages.INVALID_TOKEN
    );
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(invalidTokenResponse, {}, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid Token Please login again!!',
        status: 'failed',
        data: null,
      })
    );
  });

  it('should check for object which are not tyoe AppResponse', () => {
    const result = { message: 'jwt expired' };

    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(result, {}, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token Expired, Please login again!!',
        status: 'failed',
        data: null,
      })
    );
  });

  it('should check for object which are not tyoe AppResponse', () => {
    const result = { message: 'invalid token' };

    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(result, {}, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid Token Please login again!!',
        status: 'failed',
        data: null,
      })
    );
  });

  it('should throw a defined response for unknown error', () => {
    const result = null;

    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    responseMiddleware(result, {}, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Something Went Wrong!!',
        status: 'error',
      })
    );
  });
});
