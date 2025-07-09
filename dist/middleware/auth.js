"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticateUser = exports.authenticateUser = void 0;
const jwt_1 = require("../lib/jwt");
const prismaClient_1 = require("../lib/prismaClient");
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication token missing or malformed.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded?.userId) {
            res.status(401).json({ message: 'Invalid token.' });
            return;
        }
        const user = await prismaClient_1.prismaClient.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, nickname: true, image: true },
        });
        if (!user) {
            res.status(401).json({ message: 'User not found for this token.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired.' });
            return;
        }
        console.error('JWT verification error:', err);
        res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.authenticateUser = authenticateUser;
const optionalAuthenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded?.userId) {
            req.user = null;
            return next();
        }
        const user = await prismaClient_1.prismaClient.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, nickname: true },
        });
        req.user = user || null;
        next();
    }
    catch (err) {
        console.warn('Optional authentication failed:', err.message);
        req.user = null;
        next();
    }
};
exports.optionalAuthenticateUser = optionalAuthenticateUser;
