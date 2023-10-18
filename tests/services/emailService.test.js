const interpolateTemplate = require('../../src/helpers/interpolateTemplate');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

jest.mock('../../src/helpers/fileOperations', () => ({
  readFile: jest.fn(),
}));

jest.mock('../../src/helpers/interpolateTemplate');

const Email = require('../../src/services/emailService');
const { readFile } = require('../../src/helpers/fileOperations');

afterEach(() => {
  jest.clearAllMocks();
});

describe('Email', () => {
  describe('sendWelcome', () => {
    it('should send a welcome email', async () => {
      const email = new Email(
        { email: 'test@example.com', fullname: 'Test User' },
        'http://example.com'
      );
      email.send = jest.fn();

      await email.sendWelcome();

      expect(email.send).toHaveBeenCalledWith(
        'welcome',
        'Welcome to News Aggregator'
      );
    });
  });

  describe('sendConfirmation', () => {
    it('should send a confirmation email', async () => {
      const email = new Email(
        { email: 'test@example.com', fullname: 'Test User' },
        'http://example.com'
      );
      email.send = jest.fn();

      await email.sendConfirmation();

      expect(email.send).toHaveBeenCalledWith(
        'confirmAccount',
        'Account confirmation - valid for 5 mins'
      );
    });
  });
});

describe('Verifying the send function', () => {
  it('should send an email with correct parameters', async () => {
    const template = 'testTemplate';
    const subject = 'Test Subject';
    const fileContent = '<html>Test HTML Content</html>';

    await readFile.mockResolvedValue(fileContent);
    interpolateTemplate.mockReturnValue(fileContent);

    const email = new Email(
      { email: 'test@example.com', fullname: 'Test User' },
      'http://example.com'
    );

    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue('Email sent successfully'),
    });

    await email.send(template, subject);

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: email.from,
      to: email.to,
      subject: 'Test Subject',
      html: '<html>Test HTML Content</html>',
    });
  });

  it('should throw an error incase something happens during send function', async () => {
    const template = 'testTemplate';
    const subject = 'Test Subject';
    const fileContent = '<html>Test HTML Content</html>';

    await readFile.mockResolvedValue(fileContent);
    interpolateTemplate.mockReturnValue(fileContent);

    const email = new Email(
      { email: 'test@example.com', fullname: 'Test User' },
      'http://example.com'
    );

    nodemailer.createTransport.mockImplementation(() => {
      throw new Error('Failed to create transporter');
    });

    try {
      await email.send(template, subject);
    } catch (error) {
      expect(error).toEqual(new AppResponse('Failed to send email', null, 500));
    }
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
  });
});
