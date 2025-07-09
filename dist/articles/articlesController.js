"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticle = createArticle;
exports.getArticle = getArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
exports.getArticleList = getArticleList;
exports.createComment = createComment;
exports.getCommentList = getCommentList;
exports.addArticleLike = addArticleLike;
exports.removeArticleLike = removeArticleLike;
const superstruct_1 = require("superstruct");
const prismaClient_1 = require("../lib/prismaClient");
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("../lib/errors/NotFoundError"));
const articlesStructs_1 = require("./articlesStructs");
const commonStructs_1 = require("../lib/commonStructs");
async function createArticle(req, res) {
    const { title, content, image } = (0, superstruct_1.create)(req.body, articlesStructs_1.CreateArticleBodyStruct);
    const userId = req.user.id;
    const article = await prismaClient_1.prismaClient.article.create({
        data: {
            title,
            content,
            image,
            userId,
        },
    });
    res.status(201).send(article);
}
async function getArticle(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const article = await prismaClient_1.prismaClient.article.findUnique({ where: { id } });
    if (!article)
        throw new NotFoundError_1.default('article', id);
    res.send(article);
}
async function updateArticle(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const { title, content, image } = (0, superstruct_1.create)(req.body, articlesStructs_1.UpdateArticleBodyStruct);
    const userId = req.user.id;
    const existing = await prismaClient_1.prismaClient.article.findUnique({ where: { id } });
    if (!existing)
        throw new NotFoundError_1.default('article', id);
    if (existing.userId !== userId)
        throw new BadRequestError_1.default('No permission to update.');
    const updated = await prismaClient_1.prismaClient.article.update({
        where: { id },
        data: { title, content, image },
    });
    res.send(updated);
}
async function deleteArticle(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const userId = req.user.id;
    const article = await prismaClient_1.prismaClient.article.findUnique({ where: { id } });
    if (!article)
        throw new NotFoundError_1.default('article', id);
    if (article.userId !== userId)
        throw new BadRequestError_1.default('No permission to delete.');
    await prismaClient_1.prismaClient.article.delete({ where: { id } });
    res.status(204).send();
}
async function getArticleList(req, res) {
    const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, articlesStructs_1.GetArticleListParamsStruct);
    const currentUserId = req.user?.id;
    const where = keyword
        ? {
            title: {
                contains: keyword,
                mode: 'insensitive',
            },
        }
        : {};
    const totalCount = await prismaClient_1.prismaClient.article.count({ where });
    const articles = await prismaClient_1.prismaClient.article.findMany({
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
async function createComment(req, res) {
    const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const { content } = (0, superstruct_1.create)(req.body, articlesStructs_1.CreateArticleBodyStruct);
    const userId = req.user.id;
    const comment = await prismaClient_1.prismaClient.comment.create({
        data: { content, articleId, userId },
    });
    res.status(201).send(comment);
}
async function getCommentList(req, res) {
    const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const comments = await prismaClient_1.prismaClient.comment.findMany({
        where: { articleId },
        orderBy: { createdAt: 'desc' },
    });
    res.send(comments);
}
async function addArticleLike(req, res) {
    const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const userId = req.user.id;
    const exists = await prismaClient_1.prismaClient.articleLike.findUnique({
        where: { articleId_userId: { articleId, userId } },
    });
    if (exists)
        throw new BadRequestError_1.default('Already liked.');
    const like = await prismaClient_1.prismaClient.articleLike.create({
        data: { articleId, userId },
    });
    res.status(201).send(like);
}
async function removeArticleLike(req, res) {
    const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const userId = req.user.id;
    const exists = await prismaClient_1.prismaClient.articleLike.findUnique({
        where: { articleId_userId: { articleId, userId } },
    });
    if (!exists)
        throw new BadRequestError_1.default('Not liked.');
    await prismaClient_1.prismaClient.articleLike.delete({
        where: { articleId_userId: { articleId, userId } },
    });
    res.status(204).send();
}
