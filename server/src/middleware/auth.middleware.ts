import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
}

export const requireAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies or authorization header
    const token = 
      req.cookies.token || 
      (req.headers.authorization?.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null);

    if (!token) {
      const error = new Error('Not authenticated') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      const error = new Error('JWT secret not configured') as AppError;
      error.statusCode = 500;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: string; 
      email?: string;
      phone?: string;
    };

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      phone: decoded.phone
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      const error = new Error('Invalid or expired token') as AppError;
      error.statusCode = 401;
      next(error);
    } else {
      next(err);
    }
  }
};