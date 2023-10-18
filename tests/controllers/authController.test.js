jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'generatedToken'),
  verify: jest.fn(),
}));

jest.mock('../../src/helpers/cacheManager', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('../../src/helpers/fileOperations', () => ({
  readFile: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

const jwt = require('jsonwebtoken');
const cacheManager = require('../../src/helpers/cacheManager');
const {
  signToken,
  verifyToken,
  restrictTo,
} = require('../../src/controllers/authController');
const AppResponse = require('../../src/helpers/AppResponse');
const { commonResponseMessages } = require('../../src/data/constants');
const { readFile } = require('../../src/helpers/fileOperations');

describe('Authentication Helper function', () => {
  let next;
  let user;
  let req;
  let token;
  beforeEach(() => {
    next = jest.fn();

    user = {
      id: 'userId123',
      username: 'testuser',
      password: 'hashedPassword',
    };

    req = {
      headers: {
        authorization: 'Bearer 1234afdssddsh3578',
      },
      user: {
        role: 'admin',
      },
    };
    token = '1234afdssddsh3578';
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      callback(null, user);
    });
  });

  afterEach(() => {
    user = null;
    req = null;
    token = null;
    jest.clearAllMocks();
  });

  it('should generate token, cache user preferences, and send response', () => {
    const { password, ...rest } = user;

    cacheManager.set.mockReturnValue(`userId123-AllNews`, rest);

    signToken(user, null, next);

    expect(jwt.sign).toHaveBeenCalledWith(user, expect.any(String), {
      expiresIn: expect.any(String),
    });

    expect(cacheManager.set).toHaveBeenCalled();

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY, {
        ...rest,
        token: 'generatedToken',
      })
    );
  });

  it('should verify the Token and attach the user data to request object', async () => {
    await readFile.mockResolvedValue({ users: [user] });

    await verifyToken(req, null, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      token,
      expect.any(String),
      expect.any(Function)
    );

    expect(req.user).toEqual(user);

    expect(next).toHaveBeenCalled();
  });

  it('should verify if there is no token in headers', async () => {
    req.headers.authorization = null;

    await verifyToken(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NOT_LOGGED_IN)
    );
  });

  it('should throw error if decoden token is incorrect and have no stored user data', async () => {
    await readFile.mockResolvedValue({ users: [user] });

    user = null;

    await verifyToken(req, null, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      token,
      expect.any(String),
      expect.any(Function)
    );

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NOT_FOUND)
    );
  });

  it('should verify restrictTo is applicable only for admin users and proceed ahead', () => {
    restrictTo('admin')(req, null, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw error if user is not an admin', () => {
    req.user.role = '';
    restrictTo('admin')(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NOT_AUTHORIZED)
    );
  });
});
