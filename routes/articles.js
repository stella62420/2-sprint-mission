var express = require('express');
var router = express.Router();
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateArticleDto, UpdateArticleDto } = require('../dtos/articles.dto');

const validateCreateArticle = (req, res, next) => {
  try {
    assert(req.body, CreateArticleDto);
    next();
  } catch (error) {
    console.error('Validation error for creating article:', error);
    res.status(400).json({ message: '게시글 생성 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

const validateUpdateArticle = (req, res, next) => {
  try {
    assert(req.body, UpdateArticleDto);
    next();
  } catch (error) {
    console.error('Validation error for updating article:', error);
    res.status(400).json({ message: '게시글 수정 요청 데이터 형식이 올바르지 않습니다.' });
  }
};


router.route('/')
  .get(async (req, res) => { 
    try {
      const articles = await db.article.findMany();
      console.log(`Fetched articles.`);
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: '게시글 조회에 실패했습니다.' });
    }
  })
  .post(validateCreateArticle, async (req, res) => {
    try {
      const { title, content } = req.body;
      const newArticle = await db.article.create({ data: { title, content } });
      console.log(`Article created: ${newArticle.id}`);
      res.status(201).json(newArticle);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: '게시글 등록에 실패했습니다.' });
    }
  });


router.route('/:id') 
  .get(async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' });
    }
    try {
      const article = await db.article.findUnique({ where: { id: parsedId } });
      if (!article) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }
      res.json(article);
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      res.status(500).json({ message: '게시글 조회에 실패했습니다.' });
    }
  })
  .patch(validateUpdateArticle, async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' });
    }
    try {
      const updateData = req.body;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '수정할 내용이 없습니다.' });
      }
      const updatedArticle = await db.article.update({ where: { id: parsedId }, data: updateData });
      res.json(updatedArticle);
    } catch (error) {
      console.error('Error updating article:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '게시글 수정에 실패했습니다.' });
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' });
    }
    try {
      await db.article.delete({ where: { id: parsedId } });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting article:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
    }
  });

module.exports = router;