const { object, string, number, array, optional } = require('superstruct');

const CreateProductDto = object({
  name: string(),
  description: optional(string()),
  price: number(),
  tags: optional(array(string())),
  images: optional(array(string())),
  manufacturer: optional(string()),
});

const UpdateProductDto = object({
  name: optional(string()),
  description: optional(string()),
  price: optional(number()),
  tags: optional(array(string())),
  images: optional(array(string())),
  manufacturer: optional(string()),
});

module.exports = {
  CreateProductDto,
  UpdateProductDto,
};