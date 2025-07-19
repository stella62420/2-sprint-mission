"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyInfo = getMyInfo;
exports.updateMyInfo = updateMyInfo;
exports.changeMyPassword = changeMyPassword;
exports.getMyProducts = getMyProducts;
exports.getLikedProducts = getLikedProducts;
exports.getLikedArticles = getLikedArticles;
const superstruct_1 = require("superstruct");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaClient_1 = require("../lib/prismaClient");
const NotFoundError_1 = __importDefault(require("../lib/errors/NotFoundError"));
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
const userStruts_1 = require("./userStruts");
const productsStruct_1 = require("../products/productsStruct");
const articlesStructs_1 = require("../articles/articlesStructs");
// 내 정보 조회
async function getMyInfo(req, res) {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const user = await prismaClient_1.prismaClient.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            nickname: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user)
        throw new NotFoundError_1.default('User', userId);
    res.send(user);
}
// 내 정보 수정
async function updateMyInfo(req, res) {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { nickname, image } = (0, superstruct_1.create)(req.body, userStruts_1.UpdateUserBodyStruct);
    if (nickname) {
        const duplicate = await prismaClient_1.prismaClient.user.findUnique({ where: { nickname } });
        if (duplicate && duplicate.id !== userId) {
            throw new BadRequestError_1.default('Nickname already exists.');
        }
    }
    const updatedUser = await prismaClient_1.prismaClient.user.update({
        where: { id: userId },
        data: { nickname, image },
        select: {
            id: true,
            email: true,
            nickname: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.send(updatedUser);
}
// 비밀번호 변경
async function changeMyPassword(req, res) {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = (0, superstruct_1.create)(req.body, userStruts_1.ChangePasswordBodyStruct);
    const user = await prismaClient_1.prismaClient.user.findUnique({ where: { id: userId } });
    if (!user || !user.password)
        throw new NotFoundError_1.default('User', userId);
    const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isMatch)
        throw new BadRequestError_1.default('Invalid current password.');
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prismaClient_1.prismaClient.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    res.status(200).json({ message: 'Password updated successfully' });
}
// 내가 등록한 상품 리스트
async function getMyProducts(req, res) {
    const userId = req.user?.id;
    const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, productsStruct_1.GetProductListParamsStruct);
    const where = {
        userId,
        ...(keyword && {
            OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ],
        }),
    };
    const totalCount = await prismaClient_1.prismaClient.product.count({ where });
    const products = await prismaClient_1.prismaClient.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    });
    res.send({ list: products, totalCount });
}
// 내가 좋아요 누른 상품 리스트
async function getLikedProducts(req, res) {
    const userId = req.user?.id;
    const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, productsStruct_1.GetProductListParamsStruct);
    const liked = await prismaClient_1.prismaClient.productLike.findMany({
        where: { userId },
        select: { productId: true },
    });
    const productIds = liked.map(like => like.productId);
    const where = {
        id: { in: productIds },
        ...(keyword && {
            OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ],
        }),
    };
    const totalCount = await prismaClient_1.prismaClient.product.count({ where });
    const products = await prismaClient_1.prismaClient.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    });
    const productsWithLikedStatus = products.map(p => ({ ...p, isLiked: true }));
    res.send({ list: productsWithLikedStatus, totalCount });
}
// 내가 좋아요 누른 아티클 리스트
async function getLikedArticles(req, res) {
    const userId = req.user?.id;
    const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, articlesStructs_1.GetArticleListParamsStruct);
    const liked = await prismaClient_1.prismaClient.articleLike.findMany({
        where: { userId },
        select: { articleId: true },
    });
    const articleIds = liked.map(like => like.articleId);
    const where = {
        id: { in: articleIds },
        ...(keyword && {
            title: { contains: keyword, mode: 'insensitive' },
        }),
    };
    const totalCount = await prismaClient_1.prismaClient.article.count({ where });
    const articles = await prismaClient_1.prismaClient.article.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    });
    const articlesWithLikedStatus = articles.map(a => ({ ...a, isLiked: true }));
    res.send({ list: articlesWithLikedStatus, totalCount });
}
