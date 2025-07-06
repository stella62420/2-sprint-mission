import jwt from 'jsonwebtoken';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import BadRequestError from '../lib/errors/BadRequestError.js';
import * as bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { RegisterBodyStruct, LoginBodyStruct } from '../auth/authStructs.js';

const SALT_ROUNDS = 10; // 비밀번호 해싱 시 사용할 salt rounds

export async function register(req, res) {
  const { email, password, nickname } = create(req.body, RegisterBodyStruct);

  const existingUser = await prismaClient.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prismaClient.user.create({
    // 👈 여기서 user 객체가 생성됩니다.
    data: { email, password: hashedPassword, nickname },
  });

  // 여기서 user 객체가 제대로 정의되어 있어야 합니다.
  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

  res.status(201).json({ message: 'Registration successful', accessToken, refreshToken });
}

export async function login(req, res) {
  const { email, password } = create(req.body, LoginBodyStruct);

  const user = await prismaClient.user.findUnique({ where: { email } });

  if (!user) {
    throw new BadRequestError('Invalid email or password.'); // 또는 NotFoundError
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password.');
  }

  // 여기서 user 객체가 제대로 정의되어 있어야 합니다.
  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  }); // JWT_EXPIRES_IN 추가
  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  }); // RefreshToken 추가

  await prismaClient.user.update({
  where: { id: user.id },
  data: { refreshToken },
});

  res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
}

export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh Token is required.');
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.userId) {
    throw new BadRequestError('Invalid Refresh Token.');
  }

  const user = await prismaClient.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new BadRequestError('Invalid or expired Refresh Token.');
  }

  // 새로운 Access Token 발급
  const newAccessToken = generateAccessToken({ userId: user.id });

  res.status(200).send({ accessToken: newAccessToken });
}

