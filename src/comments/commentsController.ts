import { Request, Response } from 'express';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient';
import { UpdateCommentBodyStruct } from '../comments/commentsStruct';
import NotFoundError from '../lib/errors/NotFoundError';
import BadRequestError from '../lib/errors/BadRequestError';
import { IdParamsStruct } from '../lib/commonStructs';

export async function updateComment(req: Request, res: Response) {
  try {
    const { id } = create(req.params, IdParamsStruct);
    const { content } = create(req.body, UpdateCommentBodyStruct);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const existingComment = await prismaClient.comment.findUnique({ where: { id } });
    if (!existingComment) {
      throw new NotFoundError('comment', id);
    }

    if (existingComment.userId !== userId) {
      throw new BadRequestError('댓글을 수정할 권한이 없습니다.');
    }

    const updatedComment = await prismaClient.comment.update({
      where: { id },
      data: { content },
    });

    return res.status(200).json(updatedComment);
  } catch (err) {
    return res.status(400).json({ message: '댓글 수정 실패', error: err });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = create(req.params, IdParamsStruct);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const existingComment = await prismaClient.comment.findUnique({ where: { id } });
    if (!existingComment) {
      throw new NotFoundError('comment', id);
    }

    if (existingComment.userId !== userId) {
      throw new BadRequestError('댓글을 삭제할 권한이 없습니다.');
    }

    await prismaClient.comment.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ message: '댓글 삭제 실패', error: err });
  }
}
