import { RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { prismaClient } from '../lib/prismaClient';
import { User } from '@prisma/client';


export const authenticateUser: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication token missing or malformed.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as { userId: number };

    if (!decoded?.userId) {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }

    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nickname: true, image: true },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found for this token.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired.' });
      return;
    }

    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const optionalAuthenticateUser: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token) as { userId: number };

    if (!decoded?.userId) {
      req.user = null;
      return next();
    }

    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nickname: true },
    });

    req.user = user || null;
    next();
  } catch (err) {
    console.warn('Optional authentication failed:', (err as Error).message);
    req.user = null;
    next();
  }
};
