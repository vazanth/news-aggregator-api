jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../src/controllers/authController', () => ({
  signToken: jest.fn(),
  createverificationToken: jest.fn(),
  verifyConfirmationToken: jest.fn(),
}));

jest.mock('../../src/services/emailService', () => {
  return jest.fn().mockImplementation(() => ({
    sendConfirmation: jest.fn(),
    sendWelcome: jest.fn(),
  }));
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

const { readFile, writeFile } = require('../../src/helpers/fileOperations');
const argon2 = require('argon2');
const {
  signToken,
  createverificationToken,
  verifyConfirmationToken,
} = require('../../src/controllers/authController');
const cacheManager = require('../../src/helpers/cacheManager');
const Email = require('../../src/services/emailService');
const {
  signUp,
  signIn,
  signOut,
  getUserPreferences,
  updateUserPreferences,
  confirmUser,
} = require('../../src/controllers/userController');
const AppResponse = require('../../src/helpers/AppResponse');
const { commonResponseMessages } = require('../../src/data/constants');

let req = '';
let next = '';

beforeEach(() => {
  req = {
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
  next = jest.fn();
});

afterEach(() => {
  req = null;
  next = null;
  jest.clearAllMocks();
});

describe('User Sign-up', () => {
  it('should handle valid sign-up request', async () => {
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

  it('should handle sign-up with existing email', async () => {
    readFile.mockResolvedValue({
      users: [{ email: 'test@gmail.com' }],
    });

    await signUp(req, null, next);

    expect(readFile).toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.EMAIL_EXIST)
    );
  });
});

describe('User Sign-in', () => {
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

describe('User Signout', () => {
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

describe('Get User Preferences', () => {
  it('should fetch the user preferences available', async () => {
    const req = { userId: 'user123' };
    const user = {
      email: 'test@example.com',
      id: 'user123',
      password: 'hashedPassword',
      preferences: {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
    };
    const next = jest.fn();

    readFile.mockResolvedValue({ users: [user] });

    await getUserPreferences(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(
        commonResponseMessages.FETCHED_SUCCESSFULLY,
        user.preferences
      )
    );
  });
});

describe('Update User Preferences', () => {
  it('should update the user preferences', async () => {
    const req = {
      userId: 'user123',
      body: {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
    };

    const user = { email: 'test@gmail.com', id: 'user123' };
    const next = jest.fn();

    readFile.mockResolvedValue({
      users: [user],
    });

    writeFile.mockResolvedValue({
      users: [
        {
          email: 'test@gmail.com',
          id: 'user123',
          preferences: {
            categories: ['technology'],
            sources: ['abc-news', 'bbc-news'],
          },
        },
      ],
    });
    await updateUserPreferences(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.UPDATED_SUCCESSFULLY)
    );
  });

  it('should throw an error if user is not found', async () => {
    const req = {
      userId: '',
      body: {
        categories: ['technology'],
        sources: ['abc-news', 'bbc-news'],
      },
    };

    const user = { email: 'test@gmail.com', id: 'user123' };
    const next = jest.fn();

    readFile.mockResolvedValue({
      users: [user],
    });

    await updateUserPreferences(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NOT_FOUND)
    );
  });
});

describe('User Confirmation flow', () => {
  beforeEach(() => {
    req = {
      params: 'token123',
    };
  });
  afterEach(() => {
    req = null;
  });
  it('should throw an error if token is expired', async () => {
    readFile.mockResolvedValue({
      users: [{ email: 'test@gmail.com' }],
    });

    verifyConfirmationToken.mockReturnValue('jwt expired');

    await confirmUser(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.EXPIRED_TOKEN)
    );
  });

  it('should throw a user not found error, if token payload doesnot have any valid users', async () => {
    readFile.mockResolvedValue({
      users: [{ email: 'test@gmail.com' }],
    });

    verifyConfirmationToken.mockReturnValue({ email: 'test1@gmail.com' }); //wrong user info to throw error

    await confirmUser(req, null, next);

    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.NOT_FOUND)
    );
  });

  it('should send a welcome mail to user and remove activationToken and isActive set to true from in-memory storage', async () => {
    const resultMatcher = {
      users: [
        {
          fullname: 'test',
          email: 'test@gmail.com',
          isActive: true,
        },
        {
          fullname: 'test1',
          email: 'test1@gmail.com',
          activationToken: 'LiveLong&Prosper',
          isActive: false,
        },
      ],
    };

    const userData = {
      users: [
        {
          fullname: 'test',
          email: 'test@gmail.com',
          activationToken: 'MayThe4thBWithU',
          isActive: false,
        },
        {
          fullname: 'test1',
          email: 'test1@gmail.com',
          activationToken: 'LiveLong&Prosper',
          isActive: false,
        },
      ],
    };

    readFile.mockResolvedValue(userData);

    await writeFile.mockResolvedValue();
    verifyConfirmationToken.mockReturnValue({ email: 'test@gmail.com' });

    const emailInstance = new Email(
      { fullname: 'test', email: 'test@gmail.com' },
      'https://localhost:3000'
    );
    emailInstance.sendWelcome();

    await confirmUser(req, null, next);

    expect(writeFile).toHaveBeenCalled();
    expect(resultMatcher).toEqual(userData);
    expect(next).toHaveBeenCalledWith(
      new AppResponse(commonResponseMessages.CONFIRMED_USER)
    );
  });
});
