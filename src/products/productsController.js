import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import BadRequestError from '../lib/errors/BadRequestError.js';
import { IdParamsStruct } from '../lib/commonStructs.js';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../products/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../comments/commentsStruct.js';

export async function createProduct(req, res) {
  const { title, description, price, category, images } = create(req.body, CreateProductBodyStruct);
  const userId = req.user.id;

  const product = await prismaClient.product.create({
    data: { title, description, price, category, images, userId },
  });

  res.status(201).send(product);
}

export async function getProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const currentUserId = req.user?.id;

  const product = await prismaClient.product.findUnique({
    where: { id },
    include: {
      Likes: {
        where: currentUserId ? { userId: currentUserId } : undefined,
        select: { userId: true },
      },
    },
  });
  if (!product) {
    throw new NotFoundError('product', id);
  }

  const isLiked = product.Likes.length > 0;
  const { Likes, ...rest } = product;

  return res.send({ ...rest, isLiked });
}

export async function updateProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const { title, description, price, category, images } = create(req.body, UpdateProductBodyStruct);
  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new NotFoundError('product', id);
  }
  if (existingProduct.userId !== userId) {
    throw new BadRequestError('You do not have permission to update this product.');
  }

  const updatedProduct = await prismaClient.product.update({
    where: { id },
    data: { title, description, price, category, images },
  });

  return res.send(updatedProduct);
}

export async function deleteProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new NotFoundError('product', id);
  }
  if (existingProduct.userId !== userId) {
    throw new BadRequestError('You do not have permission to delete this product.');
  }

  await prismaClient.product.delete({ where: { id } });

  return res.status(204).send();
}

export async function getProductList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);
  const currentUserId = req.user?.id;

  const where = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      }
    : undefined;
  const totalCount = await prismaClient.product.count({ where });
  const products = await prismaClient.product.findMany({
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

export async function createComment(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const comment = await prismaClient.comment.create({ data: { productId, content, userId } });

  return res.status(201).send(comment);
}

export async function getCommentList(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const commentsWithCursorComment = await prismaClient.comment.findMany({
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

export async function addProductLike(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const existingLike = await prismaClient.productLike.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  if (existingLike) {
    throw new BadRequestError('Already liked this product.');
  }

  const like = await prismaClient.productLike.create({
    data: {
      productId,
      userId,
    },
  });

  return res.status(201).send(like);
}

export async function removeProductLike(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const existingLike = await prismaClient.productLike.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  if (!existingLike) {
    throw new BadRequestError('Not liked this product yet.');
  }

  await prismaClient.productLike.delete({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  return res.status(204).send();
}