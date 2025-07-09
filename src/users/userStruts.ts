import { object, string, nonempty, size, partial } from 'superstruct';

export const UpdateUserBodyStruct = partial(object({
  nickname: size(nonempty(string()), 2, 20),
  image: nonempty(string()),
}));

export const ChangePasswordBodyStruct = object({
  currentPassword: nonempty(string()),
  newPassword: size(nonempty(string()), 8, 30),
});
