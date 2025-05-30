const { object, string, number, optional } = require('superstruct');

const CreateCommentDto = object({
  content: string(),
});

const UpdateCommentDto = object({
  content: optional(string()),
});

module.exports = {
  CreateCommentDto,
  UpdateCommentDto,
};