var express = require('express');
var router = express.Router();
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateProductDto, UpdateProductDto } = require('../dtos/products.dto');

const CreateProduct = (req, res, next) => {
  try {
    assert(req.body, CreateProductDto);
    next();
  } catch (error) {
    console.error('상품 생성 유효성 검증 오류:', error);
    res.status(400).json({ message: '상품 생성 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

const UpdateProduct = (req, res, next) => {
  try {
    assert(req.body, UpdateProductDto);
    next();
  } catch (error) {
    console.error('상품 수정 유효성 검증 오류:', error);
    res.status(400).json({ message: '상품 수정 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

router.route('/')
  .get(async (req, res) => {
    try {
      const { offset = 0, limit = 10, sort = 'recent', query } = req.query;

      const findManyOptions = {
        skip: parseInt(offset, 10),
        take: parseInt(limit, 10),
        orderBy: {},
        where: {},
      };

      if (sort === 'recent') {
        findManyOptions.orderBy.createdAt = 'desc';
      }

      if (query) {
        findManyOptions.where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }

      const [products, totalCount] = await db.$transaction([
        db.product.findMany(findManyOptions),
        db.product.count({ where: findManyOptions.where }),
      ]);

      console.log(`상품 ${products.length}개 조회 (총 ${totalCount}개).`);
      res.json({
        products,
        pagination: {
          offset: findManyOptions.skip,
          limit: findManyOptions.take,
          totalCount,
          hasNextPage: (findManyOptions.skip + findManyOptions.take) < totalCount,
        },
      });
    } catch (error) {
      console.error('상품 조회 중 오류 발생:', error);
      res.status(500).json({ message: '상품 조회에 실패했습니다.' });
    }
  })
  .post(CreateProduct, async (req, res) => {
    try {
      const { name, description, price, tags, images, manufacturer } = req.body;

      const newProduct = await db.product.create({
        data: {
          name,
          description,
          price,
          tags,
          images,
          manufacturer,
        },
      });
      console.log(`상품이 생성되었습니다: ID ${newProduct.id}`);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('상품 생성 중 오류 발생:', error);
      res.status(500).json({ message: '상품 등록에 실패했습니다.' });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }

    try {
      const product = await db.product.findUnique({
        where: { id: parsedId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          tags: true,
          images: true,
          favoriteCount: true,
          manufacturer: true,
          recommendedScore: true, 
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      console.log(`상품 ID ${id}가 조회되었습니다.`);
      res.json(product);
    } catch (error) {
      console.error('ID로 상품 조회 중 오류 발생:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '상품 조회에 실패했습니다.' });
    }
  })
  .patch(UpdateProduct, async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    try {
      const updateData = req.body;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: '수정할 내용이 없습니다.' });
      }
      const updatedProduct = await db.product.update({ where: { id: parsedId }, data: updateData });
      console.log(`상품 ID ${id}가 수정되었습니다.`);
      res.json(updatedProduct);
    } catch (error) {
      console.error('상품 수정 중 오류 발생:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '상품 수정에 실패했습니다.' });
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
  });

router.route('/')
  .get(async (req, res) => {
    try {
      await db.product.delete({ where: { id: parsedId } });
      console.log(`상품 ID ${id}가 삭제되었습니다.`);
      res.status(204).send(); 
    } catch (error) {
      console.error('상품 삭제 중 오류 발생:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '상품 삭제에 실패했습니다.' });
    }
  });

router.route('/:id/favorite')
  .post(async (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }

    try {
      const updatedProduct = await db.product.update({
        where: { id: parsedId },
        data: { favoriteCount: { increment: 1 } },
        select: { id: true, name: true, favoriteCount: true }
      });
      console.log(`상품 ID ${id}의 찜 수가 1 증가했습니다.`);
      res.json({ message: '상품을 찜했습니다.', 상품: updatedProduct });
    } catch (error) {
      console.error(`상품 ID ${id} 찜하기 중 오류 발생:`, error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '찜하기에 실패했습니다.' });
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    try {
      await db.document.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
    } catch (error) {
      console.error(`상품 ID ${id} 추천 점수 증가 중 오류 발생:`, error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '상품 추천에 실패했습니다.' });
    }
  });


module.exports = router;