const { object, string, number, optional } = require('superstruct');

const CreateProductDto = object({
  name: string(),
  description: string(),
  price: number(),
});

const UpdateProductDto = object({
  name: optional(string()),
  description: optional(string()),
  price: optional(number()),
});

module.exports = {
  CreateProductDto,
  UpdateProductDto,
};