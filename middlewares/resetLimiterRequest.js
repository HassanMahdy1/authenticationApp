import rateLimit from 'express-rate-limit';



export const authLimiter = rateLimit({
  max: 3,
  windowMs: 10 * 60 * 1000,
  message: {
    status: 'fail',
    message: 'Too many attempts to reset your password. Please try again after 10 minutes.'
  }
});