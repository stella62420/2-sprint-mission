import { Request, Response } from 'express';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient';
import NotFoundError from '../lib/errors/NotFoundError';
import BadRequestError from '../lib/errors/BadRequestError';
import { IdParamsStruct } from '../lib/commonStructs';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../products/productsStruct';
import {
  CreateCommentBodyStruct,
  GetCommentListParamsStruct,
} from '../comments/commentsStruct';
import { Prisma } from '@prisma/client';

export async function createProduct(req: Request, res: Response) {
  const { title, description, price, category, images } = create(req.body, CreateProductBodyStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;

  const product = await prismaClient.product.create({
    data: { title, description, price, category, images, userId },
  });

  res.status(201).send(product);
}

export async function getProduct(req: Request, res: Response) {
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
  }) as Prisma.ProductGetPayload<{ include: { Likes: true } }>;

  if (!product) {
    throw new NotFoundError('product', id);
  }

  const isLiked = product.Likes.length > 0;
  const { Likes, ...rest } = product;

  return res.send({ ...rest, isLiked });
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const { title, description, price, category, images } = create(req.body, UpdateProductBodyStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

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

export async function deleteProduct(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

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

export async function getProductList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);
  const currentUserId = req.user?.id;

  let where: Prisma.ProductWhereInput = {};
  if (keyword) {
    where = {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    };
  }

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

export async function createComment(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const comment = await prismaClient.productComment.create({
    data: { productId, content, userId },
  });

  return res.status(201).send(comment);
}

export async function getCommentList(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const commentsWithCursorComment = await prismaClient.productComment.findMany({
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

export async function addProductLike(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

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
    data: { productId, userId },
  });

  return res.status(201).send(like);
}

export async function removeProductLike(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
  }

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
