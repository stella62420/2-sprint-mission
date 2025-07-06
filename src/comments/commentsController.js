import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import { UpdateCommentBodyStruct } from '../comments/commentsStruct.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import BadRequestError from '../lib/errors/BadRequestError.js'; 
import { IdParamsStruct } from '../lib/commonStructs.js';

export async function updateComment(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);
  const userId = req.user.id; 

  const existingComment = await prismaClient.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }
  if (existingComment.userId !== userId) {
    throw new BadRequestError('You do not have permission to update this comment.');
  }

  const updatedComment = await prismaClient.comment.update({
    where: { id },
    data: { content },
  });

  return res.send(updatedComment);
}

export async function deleteComment(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const userId = req.user.id; 

  const existingComment = await prismaClient.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }
  // [추가: 인가 로직]
  if (existingComment.userId !== userId) {
    throw new BadRequestError('You do not have permission to delete this comment.');
  }

  await prismaClient.comment.delete({ where: { id } });

  return res.status(204).send();
}