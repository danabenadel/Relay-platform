import { Request, Response, NextFunction } from 'express';
import { ValidationUtil } from '../utils/validation';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  if (password && !ValidationUtil.isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters with uppercase, lowercase and number'
    });
  }

  next();
};