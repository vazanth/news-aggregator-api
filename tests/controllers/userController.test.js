const {
  signUp,
  signIn,
  signOut,
} = require('../../src/controllers/userController');
const AppResponse = require('../../src/helpers/AppResponse');
const { commonResponseMessages } = require('../../src/data/constants');

jest.mock('../../src/helpers/fileOperations', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../src/controllers/authController', () => ({
  signToken: jest.fn(),
  createverificationToken: jest.fn(),
}));

jest.mock('../../src/helpers/cacheManager', () => ({
  delete: jest.fn(),
}));

jest.mock('../../src/services/emailService', () => {
  return jest.fn().mockImplementation(() => ({
    sendConfirmation: jest.fn(),
  }));
});

const { readFile, writeFile } = require('../../src/helpers/fileOperations');
const argon2 = require('argon2');
const {
  signToken,
  createverificationToken,
} = require('../../src/controllers/authController');
const cacheManager = require('../../src/helpers/cacheManager');
const Email = require('../../src/services/emailService');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('sign-up flow', () => {
  it('should handle valid sign-up request', async () => {
    const req = {
      get: function (headerName) {
        if (headerName.toLowerCase() === 'host') {
          return 'localhost';
        }
      },
      body: {
        fullname: 'test',
        email: 'test@gmail.com',
        role: 'user',
        password: 'Test123',
        preferences: {
          categories: ['technology'],
          sources: ['abc-news', 'bbc-news'],
        },
      },
    };
    const next = jest.fn();

    await readFile.mockResolvedValue({ users: [] });
    await writeFile.mockResolvedValue();
    await createverificationToken.mockResolvedValue('mockedstring');

    const emailInstance = new Email(
      { fullname: 'test', email: 'test@gmail.com' },
      'https://localhost:3000'
    );
    emailInstance.sendConfirmation();
    await signUp(req, null, next);

    expect(readFile).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
    expect(createverificationToken).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@gmail.com' })
    );
    expect(emailInstance.sendConfirmation).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.REGISTERED_SUCCESSFULLY)
    );
  });

  // it('should handle sign-up with existing email', async () => {
  //   const req = {
  //     body: {
  //       fullname: 'test',
  //       email: 'test@gmail.com',
  //       role: 'user',
  //       password: 'Test123',
  //       preferences: {
  //         categories: ['technology'],
  //         sources: ['abc-news', 'bbc-news'],
  //       },
  //     },
  //   };
  //   const next = jest.fn();

  //   readFile.mockResolvedValue({
  //     users: [{ email: 'test@gmail.com' }],
  //   });

  //   await signUp(req, null, next);

  //   expect(readFile).toHaveBeenCalled();
  //   expect(writeFile).not.toHaveBeenCalled();
  //   expect(next).toHaveBeenCalledWith(
  //     new AppResponse(commonResponseMessages.EMAIL_EXIST)
  //   );
  // });
});

describe('sign-in flow', () => {
  it('should handle a valid sign-in request', async () => {
    const user = { email: 'test@example.com', password: 'hashedPassword' }; // stored user data in the file
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const next = jest.fn();

    readFile.mockResolvedValue({ users: [user] });
    argon2.verify.mockResolvedValue(true);

    await signIn(req, null, next);

    expect(signToken).toHaveBeenCalled();
  });

  it('should handle incorrect password and throw appropriate error', async () => {
    const user = { email: 'test@example.com', password: 'hashedPassword' }; // stored user data in the file
    const req = {
      body: { email: 'test@example.com', password: 'wrongpassword' },
    };
    const next = jest.fn();

    readFile.mockResolvedValue({ users: [user] });
    argon2.verify.mockResolvedValue(false);

    await signIn(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.AUTH_INCORRECT)
    );

    expect(signToken).not.toHaveBeenCalled();
  });

  it('should handle incorrect email and throw appropriate error', async () => {
    const user = { email: 'test@example.com', password: 'hashedPassword' }; // stored user data in the file
    const req = {
      body: { email: 'wrong@example.com', password: 'password' },
    };
    const next = jest.fn();

    readFile.mockResolvedValue({ users: [user] });
    await signIn(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.AUTH_INCORRECT)
    );
    expect(argon2.verify).not.toHaveBeenCalled();
    expect(signToken).not.toHaveBeenCalled();
  });
});

describe('sign-out flow', () => {
  it('should verify if cache is deleted upon successfull sign-out', () => {
    const req = { userId: 'user123' };
    const next = jest.fn();

    signOut(req, null, next);

    expect(cacheManager.delete).toHaveBeenCalledWith(`${req.userId}-loggedIn`);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.LOGGED_OUT)
    );
  });
});
