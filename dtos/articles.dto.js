const { object, string, optional } = require('superstruct');

const CreateArticleDto = object({
  title: string(),
  content: string()
});

const UpdateArticleDto = object({
  title: optional(string()),
  content: optional(string()),
});

module.exports = {
  CreateArticleDto,
  UpdateArticleDto,
};