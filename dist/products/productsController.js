"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getProduct = getProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProductList = getProductList;
exports.createComment = createComment;
exports.getCommentList = getCommentList;
exports.addProductLike = addProductLike;
exports.removeProductLike = removeProductLike;
const superstruct_1 = require("superstruct");
const prismaClient_1 = require("../lib/prismaClient");
const NotFoundError_1 = __importDefault(require("../lib/errors/NotFoundError"));
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
const commonStructs_1 = require("../lib/commonStructs");
const productsStruct_1 = require("../products/productsStruct");
const commentsStruct_1 = require("../comments/commentsStruct");
async function createProduct(req, res) {
    const { title, description, price, category, images } = (0, superstruct_1.create)(req.body, productsStruct_1.CreateProductBodyStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const product = await prismaClient_1.prismaClient.product.create({
        data: { title, description, price, category, images, userId },
    });
    res.status(201).send(product);
}
async function getProduct(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const currentUserId = req.user?.id;
    const product = await prismaClient_1.prismaClient.product.findUnique({
        where: { id },
        include: {
            Likes: {
                where: currentUserId ? { userId: currentUserId } : undefined,
                select: { userId: true },
            },
        },
    });
    if (!product) {
        throw new NotFoundError_1.default('product', id);
    }
    const isLiked = product.Likes.length > 0;
    const { Likes, ...rest } = product;
    return res.send({ ...rest, isLiked });
}
async function updateProduct(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const { title, description, price, category, images } = (0, superstruct_1.create)(req.body, productsStruct_1.UpdateProductBodyStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', id);
    }
    if (existingProduct.userId !== userId) {
        throw new BadRequestError_1.default('You do not have permission to update this product.');
    }
    const updatedProduct = await prismaClient_1.prismaClient.product.update({
        where: { id },
        data: { title, description, price, category, images },
    });
    return res.send(updatedProduct);
}
async function deleteProduct(req, res) {
    const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', id);
    }
    if (existingProduct.userId !== userId) {
        throw new BadRequestError_1.default('You do not have permission to delete this product.');
    }
    await prismaClient_1.prismaClient.product.delete({ where: { id } });
    return res.status(204).send();
}
async function getProductList(req, res) {
    const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, productsStruct_1.GetProductListParamsStruct);
    const currentUserId = req.user?.id;
    let where = {};
    if (keyword) {
        where = {
            OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ],
        };
    }
    const totalCount = await prismaClient_1.prismaClient.product.count({ where });
    const products = await prismaClient_1.prismaClient.product.findMany({
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
    const productsWithLikedStatus = products.map(product => {
        const isLiked = product.Likes.length > 0;
        const { Likes, ...rest } = product;
        return { ...rest, isLiked };
    });
    return res.send({
        list: productsWithLikedStatus,
        totalCount,
    });
}
async function createComment(req, res) {
    const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const { content } = (0, superstruct_1.create)(req.body, commentsStruct_1.CreateCommentBodyStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', productId);
    }
    const comment = await prismaClient_1.prismaClient.productComment.create({
        data: { productId, content, userId },
    });
    return res.status(201).send(comment);
}
async function getCommentList(req, res) {
    const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    const { cursor, limit } = (0, superstruct_1.create)(req.query, commentsStruct_1.GetCommentListParamsStruct);
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', productId);
    }
    const commentsWithCursorComment = await prismaClient_1.prismaClient.productComment.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        where: { productId },
        orderBy: { createdAt: 'desc' },
    });
    const comments = commentsWithCursorComment.slice(0, limit);
    const cursorComment = commentsWithCursorComment[comments.length - 1];
    const nextCursor = cursorComment ? cursorComment.id : null;
    return res.send({
        list: comments,
        nextCursor,
    });
}
async function addProductLike(req, res) {
    const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', productId);
    }
    const existingLike = await prismaClient_1.prismaClient.productLike.findUnique({
        where: {
            productId_userId: {
                productId,
                userId,
            },
        },
    });
    if (existingLike) {
        throw new BadRequestError_1.default('Already liked this product.');
    }
    const like = await prismaClient_1.prismaClient.productLike.create({
        data: { productId, userId },
    });
    return res.status(201).send(like);
}
async function removeProductLike(req, res) {
    const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const existingProduct = await prismaClient_1.prismaClient.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError_1.default('product', productId);
    }
    const existingLike = await prismaClient_1.prismaClient.productLike.findUnique({
        where: {
            productId_userId: {
                productId,
                userId,
            },
        },
    });
    if (!existingLike) {
        throw new BadRequestError_1.default('Not liked this product yet.');
    }
    await prismaClient_1.prismaClient.productLike.delete({
        where: {
            productId_userId: {
                productId,
                userId,
            },
        },
    });
    return res.status(204).send();
}
