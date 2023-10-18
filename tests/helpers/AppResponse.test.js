const AppResponse = require('../../src/helpers/AppResponse');
const { commonResponseMessages } = require('../../src/data/constants');

describe('Verify AppResponse response construction', () => {
  it('should set status and data correctly for success message', () => {
    const message = commonResponseMessages.FETCHED_SUCCESSFULLY;
    const data = { key: 'value' };
    const appResponse = new AppResponse(message, data);

    expect(appResponse.message).toEqual(message);
    expect(appResponse.statusCode).toEqual(200);
    expect(appResponse.status).toEqual('success');
    expect(appResponse.data).toEqual(data);
    expect(appResponse.isOperational).toEqual(true);
  });

  it('should set status and data correctly for error message', () => {
    const message = commonResponseMessages.RESOURCE_NOT_FOUND;
    const data = null;
    const appResponse = new AppResponse(message, data);

    expect(appResponse.message).toEqual(message);
    expect(appResponse.statusCode).toEqual(404);
    expect(appResponse.status).toEqual('failed');
    expect(appResponse.data).toEqual(data);
    expect(appResponse.isOperational).toEqual(true);
  });

  it('should return 500 status code for unknown messages', () => {
    const unknownMessage = 'Unknown message';
    const appResponse = new AppResponse(unknownMessage);

    expect(appResponse.message).toEqual(unknownMessage);
    expect(appResponse.statusCode).toEqual(500);
    expect(appResponse.status).toEqual('error');
    expect(appResponse.data).toEqual(null);
    expect(appResponse.isOperational).toEqual(true);
  });
});

describe('AppResponse', () => {
  describe('getStatusCode', () => {
    it('should return 500 status code for an unknown message', () => {
      const unknownMessage = 'Unknown message';
      const expectedStatusCode = 500;
      const appResponse = new AppResponse();

      const statusCode = appResponse.getStatusCode(unknownMessage);

      expect(statusCode).toEqual(expectedStatusCode);
    });
  });

  describe('getStatus', () => {
    it('should return "success" for a 2xx status code', () => {
      const statusCode = 200;
      const appResponse = new AppResponse();

      const status = appResponse.getStatus(statusCode);

      expect(status).toEqual('success');
    });

    it('should return "failed" for a 4xx status code', () => {
      const statusCode = 404;
      const appResponse = new AppResponse();

      const status = appResponse.getStatus(statusCode);

      expect(status).toEqual('failed');
    });

    it('should return "error" for a 5xx status code', () => {
      const statusCode = 500;
      const appResponse = new AppResponse();

      const status = appResponse.getStatus(statusCode);

      expect(status).toEqual('error');
    });
  });
});
