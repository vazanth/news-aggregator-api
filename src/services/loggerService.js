const pino = require('pino');
const path = require('path');
const pinoPretty = require('pino-pretty');
const fs = require('fs').promises;

const logDirectory = path.join(__dirname, '..', 'logs', 'logger.log');

// Ensure the log directory exists asynchronously. If not, create it.
async function ensureLogDirectoryExists() {
  try {
    await fs.access(logDirectory);
  } catch (error) {
    // Directory does not exist, create it
    await fs.mkdir(logDirectory, { recursive: true });
  }
}

// Call the function to ensure the log directory exists
ensureLogDirectoryExists();

const levels = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const logger = pino(
  {
    redact: {
      paths: ['req.headers.authorization'], // Redact sensitive information, such as authorization headers
      remove: true, // Remove the redacted properties from the logs
    },
    customLevels: levels, // our defined levels
    useOnlyCustomLevels: true,
    timestamp: pino.stdTimeFunctions.isoTime,
    // transport: {
    //   target: 'pino-pretty',
    //   options: {
    //     colorize: true,
    //     levelFirst: true,
    //     // translateTime: 'yyyy-dd-mm, h:MM:ss TT',
    //   },
    // },
  },
  pino.destination({
    dest: logDirectory,
    sync: false,
  }),
);

const prettyStream = pinoPretty();
prettyStream.pipe(process.stdout);

module.exports = logger;
