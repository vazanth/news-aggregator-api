const express = require('express');
const helmet = require('helmet');
const userRouter = require('./routes/userRoutes');
const newsRouter = require('./routes/newsRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');
const responseMiddleware = require('./middleware/responseMiddleware');
const AppResponse = require('./helpers/AppResponse');
const { commonResponseMessages } = require('./data/constants');
const rateLimiter = require('./helpers/rateLimiter');
const logger = require('./services/loggerService');

const app = express();

//set security http headers
app.use(helmet());

// middleware for parsing request
app.use(express.json());

// rate limiter
app.use('/api', rateLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsedTime = Date.now() - start;
    logger.info(
      `Method: ${req.method} url: ${req.url} status: ${res.statusCode} responseTime: ${elapsedTime}ms userAgent: ${req.headers['user-agent']}`
    );
  });
  next();
});

// api routes
app.use('/api/users', userRouter);
app.use('/api/news', newsRouter);
app.use('/api/schedule', scheduleRouter);

app.use((req, res, next) => {
  throw next(new AppResponse(commonResponseMessages.RESOURCE_NOT_FOUND));
});

// common response middleware
app.use(responseMiddleware);

module.exports = app;
