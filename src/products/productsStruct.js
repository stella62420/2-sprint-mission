import { object, string, number, array, optional, partial } from 'superstruct';
import { PageParamsStruct } from '../lib/commonStructs.js';

export const CreateProductBodyStruct = object({
  title: string(),
  description: string(),
  price: number(),
  category: optional(string()),
  images: optional(array(string())),
});

export const ProductRegisterBody = CreateProductBodyStruct;

export const GetProductListParamsStruct = PageParamsStruct;
export const UpdateProductBodyStruct = partial(CreateProductBodyStruct);
