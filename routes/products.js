var express = require('express');
var router = express.Router();
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateProductDto, UpdateProductDto } = require('../dtos/products.dto');
const commentsRouter = require('./comments');

const validateCreateProduct = (req, res, next) => {
  try {
    assert(req.body, CreateProductDto);
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

const validateUpdateProduct = (req, res, next) => {
  try {
    assert(req.body, UpdateProductDto);
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

router.route('/')
  .get(async (req, res, next) => {
    try {
      const products = await db.product.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(products);
    } catch (error) {
      next(error);
    }
  })
  .post(validateCreateProduct, async (req, res, next) => {
    try {
      const { name, description, price, tags, images, manufacturer } = req.body;

      const newProduct = await db.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          tags: tags || [],
          images: images || [],
          manufacturer: manufacturer || null,
        }
      });
      console.log(`Product created: ${newProduct.id}`);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  });


router.route('/:id')
  .get(async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 상품 ID입니다.');
      error.status = 400;
      return next(error);
    }
    try {
      const product = await db.product.findUnique({ where: { id: parsedId } });
      if (!product) {
        const error = new Error('상품을 찾을 수 없습니다.');
        error.status = 404;
        return next(error);
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  })
  .patch(validateUpdateProduct, async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 상품 ID입니다.');
      error.status = 400;
      return next(error);
    }
    try {
      const updateData = req.body;
      if (Object.keys(updateData).length === 0) {
        const error = new Error('수정할 내용이 없습니다.');
        error.status = 400;
        return next(error);
      }

      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price);
      }

      const updatedProduct = await db.product.update({
        where: { id: parsedId },
        data: updateData
      });
      res.json(updatedProduct);
    } catch (error) {
      if (error.code === 'P2025') {
        const notFoundError = new Error('상품을 찾을 수 없습니다.');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      const error = new Error('유효하지 않은 상품 ID입니다.');
      error.status = 400;
      return next(error);
    }

    try {
      await db.product.delete({ where: { id: parsedId } });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        const notFoundError = new Error('상품을 찾을 수 없습니다.');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      next(error);
    }
  });


router.post('/:id/favorite', async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('유효하지 않은 상품 ID입니다.');
    error.status = 400;
    return next(error);
  }

  try {
    const product = await db.product.findUnique({ where: { id: parsedId } });
    if (!product) {
      const error = new Error('상품을 찾을 수 없습니다.');
      error.status = 404;
      return next(error);
    }

    const updatedProduct = await db.product.update({
      where: { id: parsedId },
      data: { favoriteCount: product.favoriteCount + 1 }
    });

    if (updatedProduct.tags && updatedProduct.tags.includes('전자제품')) {
        const finalProduct = await db.product.update({
            where: { id: parsedId },
            data: { recommendedScore: updatedProduct.recommendedScore + 1 }
        });
        return res.status(200).json({ 상품: finalProduct, message: '상품 찜 및 추천 점수 증가 성공' });
    }

    res.status(200).json({ 상품: updatedProduct, message: '상품 찜 성공' });

  } catch (error) {
    next(error);
  }
});

router.delete('/:id/favorite', async (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('유효하지 않은 상품 ID입니다.');
    error.status = 400;
    return next(error);
  }

  try {
    const product = await db.product.findUnique({ where: { id: parsedId } });
    if (!product) {
      const error = new Error('상품을 찾을 수 없습니다.');
      error.status = 404;
      return next(error);
    }

    const newFavoriteCount = Math.max(0, product.favoriteCount - 1);
    const updatedProduct = await db.product.update({
      where: { id: parsedId },
      data: { favoriteCount: newFavoriteCount }
    });

    res.status(200).json({ 상품: updatedProduct, message: '상품 찜 취소 성공' });

  } catch (error) {
    next(error);
  }
});

router.use('/:productId/comments', commentsRouter);

module.exports = router;