import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

interface JwtPayload {
  id: string;
  email: string;
  name: string | null;
  role: string;
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
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

  const freshUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });

  if (!freshUser) {
    res.status(401).json({ status: 'Error', message: 'The user belonging to this token no longer exists.' });
    return;
  }

  if (!freshUser.isVerified) {
    res.status(403).json({ status: 'Error', message: 'Your account is not verified.' });
    return;
  }

  req.user = {
    id: freshUser.id,
    role: freshUser.role,
  };

  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(403).json({ status: 'Access Denied', message: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'Access Denied',
        message: `Allowed roles for this resource: ${roles.join(', ')}.`,
      });
      return;
    }
    
    next();
  };
};