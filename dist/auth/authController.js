"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../lib/prismaClient");
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
const authStructs_1 = require("./authStructs");
const superstruct_1 = require("superstruct");
const env_1 = require("../lib/env");
// 가입 프로세스
async function register(req, res) {
    const { email, nickname, password } = (0, superstruct_1.create)(req.body, authStructs_1.RegisterBodyStruct);
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = await prismaClient_1.prismaClient.user.create({
        data: {
            email,
            nickname,
            password: hashedPassword,
        },
    });
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
    });
}
// 로그인
async function login(req, res) {
    const { email, password } = (0, superstruct_1.create)(req.body, authStructs_1.LoginBodyStruct);
    const user = await prismaClient_1.prismaClient.user.findUnique({ where: { email } });
    if (!user)
        throw new BadRequestError_1.default('Invalid credentials');
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new BadRequestError_1.default('Invalid credentials');
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.JWT_SECRET, {
        expiresIn: env_1.JWT_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.REFRESH_TOKEN_SECRET, {
        expiresIn: env_1.REFRESH_TOKEN_EXPIRES_IN,
    });
    await prismaClient_1.prismaClient.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });
    res.status(200).json({ accessToken, refreshToken });
}
// 리프레시 키로 새 access token 발급
async function refreshAccessToken(req, res) {
    const { refreshToken } = (0, superstruct_1.create)(req.body, authStructs_1.RefreshTokenBodyStruct);
    if (!refreshToken) {
        throw new BadRequestError_1.default('Refresh Token is required.');
    }
    const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.REFRESH_TOKEN_SECRET);
    const user = await prismaClient_1.prismaClient.user.findUnique({
        where: { id: decoded.userId },
    });
    if (!user || user.refreshToken !== refreshToken) {
        throw new BadRequestError_1.default('Invalid or expired Refresh Token.');
    }
    const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.JWT_SECRET, {
        expiresIn: env_1.JWT_EXPIRES_IN,
    });
    res.status(200).json({ accessToken: newAccessToken });
}
