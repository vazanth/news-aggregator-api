const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP every 15 minutes
  delayMs: 0, // No delay for exceeding rate limit
  headers: true, // Include headers in the response
  message: 'Too Many requests from this IP, please try again after some time',
});

module.exports = rateLimiter;
