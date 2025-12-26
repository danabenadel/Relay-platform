import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt.service';
import { JWTPayload } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    const payload = decoded as any;
    
    req.user = {
      userId: payload.sub,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp
    };
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      
      if (decoded) {
        const payload = decoded as any;
        
        req.user = {
          userId: payload.sub,
          email: payload.email,
          iat: payload.iat,
          exp: payload.exp
        };
      }
    } catch (error) {
      console.warn('[Auth Middleware] Optional auth failed, continuing without user');
    }
  }

  next();
};