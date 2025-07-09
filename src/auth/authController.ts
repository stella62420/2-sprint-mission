import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../lib/prismaClient';
import BadRequestError from '../lib/errors/BadRequestError';
import {
  RegisterBodyStruct,
  LoginBodyStruct,
  RefreshTokenBodyStruct,
} from './authStructs';
import { create } from 'superstruct';
import {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../lib/env';

// 가입 프로세스
export async function register(req: Request, res: Response) {
  const { email, nickname, password }: { email: string; nickname: string; password: string } =
    create(req.body, RegisterBodyStruct);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prismaClient.user.create({
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
export async function login(req: Request, res: Response) {
  const { email, password }: { email: string; password: string } =
    create(req.body, LoginBodyStruct);

  const user = await prismaClient.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestError('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new BadRequestError('Invalid credentials');

  const accessToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    }
  );


  await prismaClient.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(200).json({ accessToken, refreshToken });
}

// 리프레시 키로 새 access token 발급
export async function refreshAccessToken(req: Request, res: Response) {
  const { refreshToken } = create(req.body, RefreshTokenBodyStruct) as {
    refreshToken: string;
  };

  if (!refreshToken) {
    throw new BadRequestError('Refresh Token is required.');
  }

  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET ) as {
    userId: number;
  };

  const user = await prismaClient.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new BadRequestError('Invalid or expired Refresh Token.');
  }

  const newAccessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });


  res.status(200).json({ accessToken: newAccessToken });
}
