const app = require('./app');
const { SERVER_PORT } = require('./config');

const PORT = Number(SERVER_PORT);
const server = app.listen(PORT, () => {
  console.log(`Express Server started successfully on port: ${PORT} 🚀🚀🚀`);
});

process.on('unhandledRejection', (err) => {
  console.log('SHUTTING DOWN THE SERVER🎇🎇');
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
