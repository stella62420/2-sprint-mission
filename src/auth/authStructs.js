import { object, string, nonempty, size, pattern } from 'superstruct';

export const RegisterBodyStruct = object({
  email: nonempty(string(), pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  nickname: nonempty(string(), size(string(), 2, 20)),
  password: nonempty(string(), size(string(), 8, 30)),
});

export const LoginBodyStruct = object({
  email: nonempty(string()),
  password: nonempty(string()),
});

export const ChangePasswordBody = object({
  oldPassword: string(),
  newPassword: string(),
});
