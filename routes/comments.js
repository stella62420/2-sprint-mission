
var express = require('express');
var router = express.Router({ mergeParams: true });
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateCommentDto, UpdateCommentDto } = require('../dtos/comments.dto');

const validateCreateComment = (req, res, next) => {
  try {
    assert(req.body, CreateCommentDto);
    next();
  } catch (error) {
    console.error('Validation error for creating comment:', error);
    res.status(400).json({ message: '댓글 생성 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

const validateUpdateComment = (req, res, next) => {
  try {
    assert(req.body, UpdateCommentDto);
    next();
  } catch (error) {
    console.error('Validation error for updating comment:', error);
    res.status(400).json({ message: '댓글 수정 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

router.route('/')
  .get(async (req, res) => {
    const articleId = parseInt(req.params.articleId, 10);
    const productId = parseInt(req.params.productId, 10);

    let whereCondition = {};
    if (!isNaN(articleId)) {
      whereCondition.articleId = articleId;
    } else if (!isNaN(productId)) {
      whereCondition.productId = productId;
    } else {
      return res.status(400).json({ message: '유효한 게시글 ID 또는 상품 ID가 필요합니다.' });
    }

    try {
      const comments = await db.comment.findMany({ where: whereCondition });
      console.log(`Fetched ${comments.length} comments for parent ID: ${articleId || productId}.`);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: '댓글 조회에 실패했습니다.' });
    }
  })
  .post(validateCreateComment, async (req, res) => {
    const articleId = parseInt(req.params.articleId, 10);
    const productId = parseInt(req.params.productId, 10);
    const { content } = req.body;

    if (isNaN(articleId) && isNaN(productId)) {
      return res.status(400).json({ message: '유효한 게시글 ID 또는 상품 ID가 필요합니다.' });
    }

    try {
      let newComment;
      if (!isNaN(articleId)) {
        newComment = await db.comment.create({ data: { content, articleId } });
      } else {
        newComment = await db.comment.create({ data: { content, productId } });
      }

      console.log(`Comment created: ${newComment.id} for parent ID: ${articleId || productId}.`);
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: '댓글 등록에 실패했습니다.' });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
    const articleId = parseInt(req.params.articleId, 10);
    const productId = parseInt(req.params.productId, 10);

    if (isNaN(commentId)) {
      return res.status(400).json({ message: '유효하지 않은 댓글 ID입니다.' });
    }

    let whereCondition = { id: commentId };
    if (!isNaN(articleId)) {
     whereCondition.articleId = articleId;
    } else if (!isNaN(productId)) { // productId 조건 추가
      whereCondition.productId = productId;
    } else {
        return res.status(400).json({ message: '유효한 게시글 ID 또는 상품 ID가 필요합니다.' }); // 부모 ID 없을 때 에러 처리
    }

    try {
      const comment = await db.comment.findUnique({ where: whereCondition });
      if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }
      res.json(comment);
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      res.status(500).json({ message: '댓글 조회에 실패했습니다.' });
    }
  })
  .patch(validateUpdateComment, async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
    const articleId = parseInt(req.params.articleId, 10);
    const productId = parseInt(req.params.productId, 10);
    const updateData = req.body;

    if (isNaN(commentId)) {
     return res.status(400).json({ message: '유효하지 않은 댓글 ID입니다.' });
   }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '수정할 내용이 없습니다.' });
    }

    let whereCondition = { id: commentId };
     if (!isNaN(articleId)) {
      whereCondition.articleId = articleId;
    } else if (!isNaN(productId)) {
      whereCondition.productId = productId;
    } else {
        return res.status(400).json({ message: '유효한 게시글 ID 또는 상품 ID가 필요합니다.' });
    }

    try {
      const updatedComment = await db.comment.update({ where: whereCondition, data: updateData });
      res.json(updatedComment);
    } catch (error) {
     console.error('Error updating comment:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
    }
  })
  .delete(async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
    const articleId = parseInt(req.params.articleId, 10);
    const productId = parseInt(req.params.productId, 10);

    if (isNaN(commentId)) {
       return res.status(400).json({ message: '유효하지 않은 댓글 ID입니다.' });
     }

    let whereCondition = { id: commentId };
    if (!isNaN(articleId)) {
      whereCondition.articleId = articleId;
    } else if (!isNaN(productId)) {
      whereCondition.productId = productId;
    } else {
        return res.status(400).json({ message: '유효한 게시글 ID 또는 상품 ID가 필요합니다.' });
    }

    try {
      await db.comment.delete({ where: whereCondition });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
    }
  });

module.exports = router;