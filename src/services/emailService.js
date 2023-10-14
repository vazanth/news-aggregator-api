const nodemailer = require('nodemailer');
const interpolateTemplate = require('../helpers/interpolateTemplate');
const path = require('path');
const {
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  EMAIL_USER_NAME,
  EMAIL_PASSWORD,
} = require('../config');
const { readFile } = require('../helpers/fileOperations');

class Email {
  constructor(user, url) {
    this.from = `Admin <${EMAIL_FROM}>`;
    this.to = user.email;
    this.firstName = user.fullname;
    this.url = url;
  }

  prepareTransport() {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: EMAIL_USER_NAME,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const filePath = path.join(
      __dirname,
      '..',
      'helpers',
      'templates',
      `${template}.html`
    );
    const fileContent = await readFile(filePath, true);
    const html = interpolateTemplate(fileContent, {
      userName: this.firstName,
      verificationLink: this.url,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
    };
    try {
      await this.prepareTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('err', error);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to News Aggregator');
  }

  async sendConfirmation() {
    await this.send(
      'confirmAccount',
      'Account confirmation - valid for 5 mins'
    );
  }
}

module.exports = Email;
