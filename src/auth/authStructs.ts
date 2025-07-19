import { object, string, size } from 'superstruct';

export const RegisterBodyStruct = object({
  email: size(string(), 5, 100), 
  nickname: size(string(), 2, 20),
  password: size(string(), 8, 30),
});

export const LoginBodyStruct = object({
  email: size(string(), 5, 100),
  password: size(string(), 8, 30),
});

export const ChangePasswordBody = object({
  oldPassword: size(string(), 8, 30),
  newPassword: size(string(), 8, 30),
});

export const RefreshTokenBodyStruct = object({
  refreshToken: size(string(), 10, 500),
});
