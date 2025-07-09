import { Request, Response } from 'express';
import { create } from 'superstruct';
import bcrypt from 'bcrypt';
import { prismaClient } from '../lib/prismaClient';
import NotFoundError from '../lib/errors/NotFoundError';
import BadRequestError from '../lib/errors/BadRequestError';
import { UpdateUserBodyStruct, ChangePasswordBodyStruct } from './userStruts';
import { GetProductListParamsStruct } from '../products/productsStruct';
import { GetArticleListParamsStruct } from '../articles/articlesStructs';

// 내 정보 조회
export async function getMyInfo(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

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

  if (!user) throw new NotFoundError('User', userId);
  res.send(user);
}

// 내 정보 수정
export async function updateMyInfo(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { nickname, image } = create(req.body, UpdateUserBodyStruct);

  if (nickname) {
    const duplicate = await prismaClient.user.findUnique({ where: { nickname } });
    if (duplicate && duplicate.id !== userId) {
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

// 비밀번호 변경
export async function changeMyPassword(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = create(req.body, ChangePasswordBodyStruct);

  const user = await prismaClient.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) throw new NotFoundError('User', userId);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new BadRequestError('Invalid current password.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prismaClient.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.status(200).json({ message: 'Password updated successfully' });
}

// 내가 등록한 상품 리스트
export async function getMyProducts(req: Request, res: Response) {
  const userId = req.user?.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const where = {
    userId,
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }),
  };

  const totalCount = await prismaClient.product.count({ where });

  const products = await prismaClient.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
  });

  res.send({ list: products, totalCount });
}

// 내가 좋아요 누른 상품 리스트
export async function getLikedProducts(req: Request, res: Response) {
  const userId = req.user?.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const liked = await prismaClient.productLike.findMany({
    where: { userId },
    select: { productId: true },
  });

  const productIds = liked.map(like => like.productId);

  const where = {
    id: { in: productIds },
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }),
  };

  const totalCount = await prismaClient.product.count({ where });

  const products = await prismaClient.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
  });

  const productsWithLikedStatus = products.map(p => ({ ...p, isLiked: true }));
  res.send({ list: productsWithLikedStatus, totalCount });
}

// 내가 좋아요 누른 아티클 리스트
export async function getLikedArticles(req: Request, res: Response) {
  const userId = req.user?.id;
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

  const liked = await prismaClient.articleLike.findMany({
    where: { userId },
    select: { articleId: true },
  });

  const articleIds = liked.map(like => like.articleId);

  const where = {
    id: { in: articleIds },
    ...(keyword && {
      title: { contains: keyword, mode: 'insensitive' as const },
    }),
  };

  const totalCount = await prismaClient.article.count({ where });

  const articles = await prismaClient.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
  });

  const articlesWithLikedStatus = articles.map(a => ({ ...a, isLiked: true }));
  res.send({ list: articlesWithLikedStatus, totalCount });
}
