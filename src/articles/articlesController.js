import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import BadRequestError from '../lib/errors/BadRequestError.js'; 
import { IdParamsStruct } from '../lib/commonStructs.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../articles/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../comments/commentsStruct.js';

export async function createArticle(req, res) {
  const data = create(req.body, CreateArticleBodyStruct);
  const userId = req.user.id; 

  const article = await prismaClient.article.create({ data: { ...data, userId } }); 

  return res.status(201).send(article);
}

export async function getArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const currentUserId = req.user?.id; 

  const article = await prismaClient.article.findUnique({
    where: { id },
    include: {
      Likes: { 
        where: { userId: currentUserId },
        select: { userId: true },
      },
    },
  });
  if (!article) {
    throw new NotFoundError('article', id);
  }

  const isLiked = article.Likes.length > 0; 
  const { Likes, ...rest } = article;

  return res.send({ ...rest, isLiked }); 
}

export async function updateArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);
  const userId = req.user.id;

  const existingArticle = await prismaClient.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new NotFoundError('article', id);
  }
  if (existingArticle.userId !== userId) {
    throw new BadRequestError('You do not have permission to update this article.');
  }

  const article = await prismaClient.article.update({ where: { id }, data });

  return res.send(article);
}

export async function deleteArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const userId = req.user.id; 

  const existingArticle = await prismaClient.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new NotFoundError('article', id);
  }
  if (existingArticle.userId !== userId) {
    throw new BadRequestError('You do not have permission to delete this article.');
  }

  await prismaClient.article.delete({ where: { id } });

  return res.status(204).send();
}

export async function getArticleList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);
  const currentUserId = req.user?.id || null;

  const where = {
    title: keyword ? { contains: keyword } : undefined,
  };

  const totalCount = await prismaClient.article.count({ where });
  const articles = await prismaClient.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
    include: { 
      Likes: {
        where: currentUserId ? { userId: currentUserId } : undefined,
        select: { userId: true },
      },
    },
  });

  const articlesWithLikedStatus = articles.map(article => {
    const isLiked = article.Likes.length > 0;
    const { Likes, ...rest } = article;
    return { ...rest, isLiked };
  });

  return res.send({
    list: articlesWithLikedStatus,
    totalCount,
  });
}

export async function createComment(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const userId = req.user.id; 

  const existingArticle = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    throw new NotFoundError('article', articleId);
  }

  const comment = await prismaClient.comment.create({
    data: {
      articleId,
      content,
      userId, 
    },
  });

  return res.status(201).send(comment);
}

export async function getCommentList(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const article = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new NotFoundError('article', articleId);
  }

  const commentsWithCursor = await prismaClient.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });

  const hasNext = commentsWithCursor.length > limit;
  const comments = hasNext ? commentsWithCursor.slice(0, limit) : commentsWithCursor;
  const nextCursor = hasNext ? commentsWithCursor[limit].id : null;

  return res.send({
    list: comments,
    nextCursor,
  });
}

// [추가: 좋아요 기능]
export async function addArticleLike(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const userId = req.user.id;

  const existingArticle = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    throw new NotFoundError('article', articleId);
  }

  try {
    const like = await prismaClient.articleLike.create({
      data: {
        articleId,
        userId,
      },
    });
    return res.status(201).send(like);
  } catch (error) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
      throw new BadRequestError('Already liked this article.');
    }
    throw error;
  }
}

// [추가: 좋아요 취소 기능]
export async function removeArticleLike(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const userId = req.user.id;

  const existingArticle = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    throw new NotFoundError('article', articleId);
  }

  const existingLike = await prismaClient.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  });

  if (!existingLike) {
    throw new BadRequestError('Not liked this article yet.');
  }

  await prismaClient.articleLike.delete({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  });

  return res.status(204).send();
}