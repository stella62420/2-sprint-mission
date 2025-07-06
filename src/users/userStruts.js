import { object, string, nonempty, size, partial } from 'superstruct';

export const UpdateUserBodyStruct = partial(object({
  nickname: nonempty(string(), size(string(), 2, 20)),
  image: string(),
}));

export const ChangePasswordBodyStruct = object({
  currentPassword: nonempty(string()),
  newPassword: nonempty(string(), size(string(), 8, 30)),
});