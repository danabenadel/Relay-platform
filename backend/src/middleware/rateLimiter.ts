import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return false;
  }
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const oauthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many OAuth attempts, try again later'
  }
});

export const oauthCallbackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Too many OAuth callback attempts'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const oauthRedirectLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many OAuth redirect attempts'
  }
});