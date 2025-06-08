var express = require('express');
var router = express.Router();
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateArticleDto, UpdateArticleDto } = require('../dtos/articles.dto');
const commentsRouter = require('./comments');

const validateCreateArticle = (req, res, next) => {
  try {
    assert(req.body, CreateArticleDto);
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

const validateUpdateArticle = (req, res, next) => {
  try {
    assert(req.body, UpdateArticleDto);
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

router.route('/')
  .get(async (req, res, next) => {
    try {
      const articles = await db.article.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(articles);
    } catch (error) {
      next(error);
    }
  })
  .post(validateCreateArticle, async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const newArticle = await db.article.create({ data: { title, content } });
      console.log(`Article created: ${newArticle.id}`);
      res.status(201).json(newArticle);
    } catch (error) {
      next(error);
    }
  });

router.route('/:id')
  .get(async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 게시글 ID입니다.');
      error.status = 400;
      return next(error);
    }

    try {
      const article = await db.article.findUnique({ where: { id: parsedId } });
      if (!article) {
        const error = new Error('게시글을 찾을 수 없습니다.');
        error.status = 404;
        return next(error);
      }
      res.json(article);
    } catch (error) {
      next(error);
    }
  })
  .patch(validateUpdateArticle, async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 게시글 ID입니다.');
      error.status = 400;
      return next(error);
    }

    try {
      const updateData = req.body;
      if (Object.keys(updateData).length === 0) {
        const error = new Error('수정할 내용이 없습니다.');
        error.status = 400;
        return next(error);
      }

      const updatedArticle = await db.article.update({
        where: { id: parsedId },
        data: updateData
      });
      res.json(updatedArticle);
    } catch (error) {
      if (error.code === 'P2025') {
        const notFoundError = new Error('게시글을 찾을 수 없습니다.');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 게시글 ID입니다.');
      error.status = 400;
      return next(error);
    }

    try {
      await db.article.delete({ where: { id: parsedId } });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        const notFoundError = new Error('게시글을 찾을 수 없습니다.');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      next(error);
    }
  });

router.use('/:articleId/comments', commentsRouter);

module.exports = router;