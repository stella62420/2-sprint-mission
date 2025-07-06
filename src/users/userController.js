import { create } from 'superstruct'; 
import { prismaClient } from '../lib/prismaClient.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import BadRequestError from '../lib/errors/BadRequestError.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserBodyStruct, ChangePasswordBodyStruct } from './userStruts.js';
import { GetProductListParamsStruct } from '../products/productsStruct.js';
import { GetArticleListParamsStruct } from '../articles/articlesStructs.js';

export async function getMyInfo(req, res) {
  const userId = req.user.id;

  const user = await prismaClient.user.findUnique({
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

  if (!user) {
    throw new NotFoundError('User', userId);
  }

  res.send(user);
}

export async function updateMyInfo(req, res) {
  const userId = req.user.id;
  const { nickname, image } = create(req.body, UpdateUserBodyStruct);

  // 닉네임 중복 확인 (선택 사항)
  if (nickname) {
    const existingUserWithNickname = await prismaClient.user.findUnique({
      where: { nickname },
    });
    if (existingUserWithNickname && existingUserWithNickname.id !== userId) {
      throw new BadRequestError('Nickname already exists.');
    }
  }

  const updatedUser = await prismaClient.user.update({
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

export async function changeMyPassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = create(req.body, ChangePasswordBodyStruct);

  const user = req.user;

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid current password.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prismaClient.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.status(200).json({ message: 'Password updated successfully' });
}

export async function getMyProducts(req, res) {
  const userId = req.user.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const where = {
    userId,
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
  };

  const totalCount = await prismaClient.product.count({ where });
  const products = await prismaClient.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
  });

  res.send({
    list: products,
    totalCount,
  });
}

export async function getLikedProducts(req, res) {
  const userId = req.user.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const likedProductIds = await prismaClient.productLike.findMany({
    where: { userId },
    select: { productId: true },
  });
  const productIds = likedProductIds.map(like => like.productId);

  const where = {
    id: { in: productIds },
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
  };

  const totalCount = await prismaClient.product.count({ where });
  const products = await prismaClient.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
  });

  const productsWithLikedStatus = products.map(product => ({ ...product, isLiked: true }));

  res.send({
    list: productsWithLikedStatus,
    totalCount,
  });
}

export async function getLikedArticles(req, res) {
  const userId = req.user.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

  const likedArticleIds = await prismaClient.articleLike.findMany({
    where: { userId },
    select: { articleId: true },
  });
  const articleIds = likedArticleIds.map(like => like.articleId);

  const where = {
    id: { in: articleIds },
    ...(keyword && {
      title: { contains: keyword, mode: 'insensitive' },
    }),
  };

  const totalCount = await prismaClient.article.count({ where });
  const articles = await prismaClient.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
  });

  const articlesWithLikedStatus = articles.map(article => ({ ...article, isLiked: true }));

  res.send({
    list: articlesWithLikedStatus,
    totalCount,
  });
}