import {
  coerce,
  nonempty,
  optional,
  object,
  partial,
  string,
  Infer,
} from 'superstruct';
import { PageParamsStruct } from '../lib/commonStructs';

export const GetArticleListParamsStruct = PageParamsStruct;

export const CreateArticleBodyStruct = object({
  title: coerce(nonempty(string()), string(), (value) => value.trim()),
  content: nonempty(string()),
  image: optional(string()),
});

export const UpdateArticleBodyStruct = partial(CreateArticleBodyStruct);

export type CreateArticleBody = Infer<typeof CreateArticleBodyStruct>;
export type UpdateArticleBody = Infer<typeof UpdateArticleBodyStruct>;
export type GetArticleListParams = Infer<typeof GetArticleListParamsStruct>;