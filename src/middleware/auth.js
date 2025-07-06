import { verifyAccessToken } from '../lib/jwt.js';
import { prismaClient } from '../lib/prismaClient.js';

export async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Authentication token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).send({ message: 'Invalid token.' });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      select: { 
          id: true, 
          email: true, 
          nickname: true ,
          password: true, 
        },
    });

    if (!user) {
      return res.status(401).send({ message: 'User not found for this token.' });
    }

    req.user = user; 
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'Token expired.' });
    }
    console.error('JWT verification error:', err);
    return res.status(401).send({ message: 'Invalid token.' });
  }
}

export async function optionalAuthenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null; 
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
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
    console.warn('Optional authentication failed:', err.message);
    req.user = null;
    next();
  }
}