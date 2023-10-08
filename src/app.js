const express = require('express');
const userRouter = require('./routes/userRoutes');
const newsRouter = require('./routes/newsRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');
const responseMiddleware = require('./middleware/responseMiddleware');
const app = express();

// middleware for parsing request
app.use(express.json());

// api routes
app.use('/api/users', userRouter);
app.use('/api/news', newsRouter);
app.use('/api/schedule', scheduleRouter);

// common response middleware
app.use(responseMiddleware);

module.exports = app;
