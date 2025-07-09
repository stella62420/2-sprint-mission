"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
const superstruct_1 = require("superstruct");
const prismaClient_1 = require("../lib/prismaClient");
const commentsStruct_1 = require("../comments/commentsStruct");
const NotFoundError_1 = __importDefault(require("../lib/errors/NotFoundError"));
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
const commonStructs_1 = require("../lib/commonStructs");
async function updateComment(req, res) {
    try {
        const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { content } = (0, superstruct_1.create)(req.body, commentsStruct_1.UpdateCommentBodyStruct);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
        }
        const existingComment = await prismaClient_1.prismaClient.comment.findUnique({ where: { id } });
        if (!existingComment) {
            throw new NotFoundError_1.default('comment', id);
        }
        if (existingComment.userId !== userId) {
            throw new BadRequestError_1.default('댓글을 수정할 권한이 없습니다.');
        }
        const updatedComment = await prismaClient_1.prismaClient.comment.update({
            where: { id },
            data: { content },
        });
        return res.status(200).json(updatedComment);
    }
    catch (err) {
        return res.status(400).json({ message: '댓글 수정 실패', error: err });
    }
}
async function deleteComment(req, res) {
    try {
        const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
        }
        const existingComment = await prismaClient_1.prismaClient.comment.findUnique({ where: { id } });
        if (!existingComment) {
            throw new NotFoundError_1.default('comment', id);
        }
        if (existingComment.userId !== userId) {
            throw new BadRequestError_1.default('댓글을 삭제할 권한이 없습니다.');
        }
        await prismaClient_1.prismaClient.comment.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        return res.status(400).json({ message: '댓글 삭제 실패', error: err });
    }
}
