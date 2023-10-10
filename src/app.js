const express = require('express');
const userRouter = require('./routes/userRoutes');
const newsRouter = require('./routes/newsRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');
const responseMiddleware = require('./middleware/responseMiddleware');
const AppResponse = require('./helpers/AppResponse');
const { commonResponseMessages } = require('./data/constants');
const app = express();

// middleware for parsing request
app.use(express.json());

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
