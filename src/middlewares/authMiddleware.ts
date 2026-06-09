import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

interface JwtPayload {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        isVerified: boolean;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ status: 'Error', message: 'Not authorized. Please log in first.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ status: 'Error', message: 'Server configuration error.' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.isVerified) {
      res.status(403).json({
        status: 'Error',
        message: 'Your account is not verified. Please verify your email first.',
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      isVerified: decoded.isVerified,
    };

    next();
  } catch (error: any) {
    let message = 'Invalid or expired token. Please log in again.';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Security check failed.';
    }

    res.status(401).json({
      status: 'Error',
      message,
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(403).json({ status: 'Access Denied', message: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      const freshUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });

      if (freshUser && roles.includes(freshUser.role)) {
        req.user.role = freshUser.role;
      } else {
        res.status(403).json({
          status: 'Access Denied',
          message: `Allowed roles for this resource: ${roles.join(', ')}.`,
        });
        return;
      }
    }
    
    next();
  };
};

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(403).json({ status: 'Error', message: 'Not authenticated.' });
    return;
  }

  if (req.user.role !== 'SuperAdmin') {
    const freshUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (freshUser && freshUser.role === 'SuperAdmin') {
      req.user.role = freshUser.role;
    } else {
      res.status(403).json({
        status: 'Error',
        message: 'Access denied. SuperAdmin privileges required.',
      });
      return;
    }
  }
  
  next();
};