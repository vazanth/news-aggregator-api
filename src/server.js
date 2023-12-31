/* eslint-disable no-console */
const app = require('./app');
const { SERVER_PORT } = require('./config');

const PORT = Number(SERVER_PORT);
const server = app.listen(PORT, () => {
  console.log(`Express Server started successfully on port: ${PORT} 🚀🚀🚀`);
});

process.on('unhandledRejection', (err) => {
  console.error('SHUTTING DOWN THE SERVER🎇🎇', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
