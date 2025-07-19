import { Request, Response } from 'express';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/NotFoundError';
import { CreateArticleBodyStruct, UpdateArticleBodyStruct, GetArticleListParamsStruct } from './articlesStructs';
import { IdParamsStruct } from '../lib/commonStructs';

export async function createArticle(req: Request, res: Response) {
  const { title, content, image } = create(req.body, CreateArticleBodyStruct);
  const userId = req.user!.id;

  const article = await prismaClient.article.create({
    data: {
      title,
      content,
      image,
      userId,
    },
  });

  res.status(201).send(article);
}

export async function getArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const article = await prismaClient.article.findUnique({ where: { id } });

  if (!article) throw new NotFoundError('article', id);
  res.send(article);
}

export async function updateArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const { title, content, image } = create(req.body, UpdateArticleBodyStruct);
  const userId = req.user!.id;

  const existing = await prismaClient.article.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('article', id);
  if (existing.userId !== userId) throw new BadRequestError('No permission to update.');

  const updated = await prismaClient.article.update({
    where: { id },
    data: { title, content, image },
  });

  res.send(updated);
}

export async function deleteArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const userId = req.user!.id;

  const article = await prismaClient.article.findUnique({ where: { id } });
  if (!article) throw new NotFoundError('article', id);
  if (article.userId !== userId) throw new BadRequestError('No permission to delete.');

  await prismaClient.article.delete({ where: { id } });
  res.status(204).send();
}

export async function getArticleList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);
  const currentUserId = req.user?.id;

  const where = keyword
    ? {
        title: {
          contains: keyword,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const totalCount = await prismaClient.article.count({ where });

  const articles = await prismaClient.article.findMany({
    where,
    orderBy: orderBy === 'recent'
      ? [{ createdAt: 'desc' }]
      : [{ id: 'asc' }],
    include: {
      Likes: true,
    },
  });


  const result = articles.map(({ Likes = [], ...rest }) => ({
    ...rest,
    isLiked: Likes.length > 0,
  }));

  res.send({
    list: result,
    totalCount,
  });
  }

export async function createComment(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateArticleBodyStruct);
  const userId = req.user!.id;

  const comment = await prismaClient.comment.create({
    data: { content, articleId, userId },
  });

  res.status(201).send(comment);
}

export async function getCommentList(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);

  const comments = await prismaClient.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });

  res.send(comments);
}

export async function addArticleLike(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const userId = req.user!.id;

  const exists = await prismaClient.articleLike.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });

  if (exists) throw new BadRequestError('Already liked.');

  const like = await prismaClient.articleLike.create({
    data: { articleId, userId },
  });

  res.status(201).send(like);
}

export async function removeArticleLike(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const userId = req.user!.id;

  const exists = await prismaClient.articleLike.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });

  if (!exists) throw new BadRequestError('Not liked.');

  await prismaClient.articleLike.delete({
    where: { articleId_userId: { articleId, userId } },
  });

  res.status(204).send();
}
