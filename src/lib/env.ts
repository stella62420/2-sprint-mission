import dotenv from 'dotenv';
import path from 'path';
import type { Secret } from 'jsonwebtoken';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const PUBLIC_PATH = '/public';
export const STATIC_PATH = path.join(process.cwd(), 'public');

export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const REFRESH_TOKEN_SECRET: Secret =
  process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
