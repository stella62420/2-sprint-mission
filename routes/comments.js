var express = require('express');
var router = express.Router({ mergeParams: true });
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateCommentDto, UpdateCommentDto } = require('../dtos/comments.dto');

router.get('/', async (req, res, next) => {
    try {
        const parentId = req.params.articleId || req.params.productId;

        let comments;
        if (req.params.articleId) {
            comments = await db.comment.findMany({
                where: { articleId: parseInt(req.params.articleId) },
                orderBy: { createdAt: 'desc' },
            });
        } else if (req.params.productId) {
            comments = await db.comment.findMany({
                where: { productId: parseInt(req.params.productId) },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            return res.status(400).json({ message: 'Invalid parent type.' });
        }

        res.status(200).json({ comments });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { content } = req.body;

        const parentId = req.params.articleId || req.params.productId;
        let newComment;
        if (req.params.articleId) {
            newComment = await db.comment.create({
                data: {
                    content,
                    article: {
                        connect: { id: parseInt(req.params.articleId) }
                    }
                }
            });
        } else if (req.params.productId) {
            newComment = await db.comment.create({
                data: {
                    content,
                    product: {
                        connect: { id: parseInt(req.params.productId) }
                    }
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid parent type.' });
        }

        res.status(201).json({ comment: newComment, message: '댓글이 성공적으로 생성되었습니다.' });
    } catch (error) {
        next(error);
    }
});

router.get('/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const parentId = req.params.articleId || req.params.productId;
        const comment = await db.comment.findUnique({
            where: {
                id: parseInt(commentId)
            }
        });

        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (req.params.articleId && comment.articleId !== parseInt(req.params.articleId)) {
            return res.status(404).json({ message: '이 게시글의 댓글이 아닙니다.' });
        }
        if (req.params.productId && comment.productId !== parseInt(req.params.productId)) {
            return res.status(404).json({ message: '이 상품의 댓글이 아닙니다.' });
        }

        res.status(200).json({ comment });
    } catch (error) {
        next(error);
    }
});

router.patch('/:commentId', async (req, res, next) => {
    try {
        assert(req.body, UpdateCommentDto);
        const { content } = req.body;
        const { commentId } = req.params;
        const parentId = req.params.articleId || req.params.productId;
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: '수정할 내용이 없습니다.' });
        }
        const existingComment = await db.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (req.params.articleId && existingComment.articleId !== parseInt(req.params.articleId)) {
            return res.status(404).json({ message: '이 게시글의 댓글이 아닙니다.' });
        }
        if (req.params.productId && existingComment.productId !== parseInt(req.params.productId)) {
            return res.status(404).json({ message: '이 상품의 댓글이 아닙니다.' });
        }

        const updatedComment = await db.comment.update({
            where: { id: parseInt(commentId) },
            data: { content }
        });

        res.status(200).json({ comment: updatedComment, message: '댓글이 성공적으로 수정되었습니다.' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const parentId = req.params.articleId || req.params.productId;

        const existingComment = await db.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (req.params.articleId && existingComment.articleId !== parseInt(req.params.articleId)) {
            return res.status(404).json({ message: '이 게시글의 댓글이 아닙니다.' });
        }
        if (req.params.productId && existingComment.productId !== parseInt(req.params.productId)) {
            return res.status(404).json({ message: '이 상품의 댓글이 아닙니다.' });
        }

        await db.comment.delete({
            where: { id: parseInt(commentId) }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;