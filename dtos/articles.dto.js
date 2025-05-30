const { object, string } = require('superstruct');

const CreateArticleDto = object({
  title: string(),
  content: string()
});

const UpdateArticleDto = object({
  title: string(),
  content: string()
});

module.exports = {
  CreateArticleDto,
  UpdateArticleDto,
};