var express = require('express');
var router = express.Router();
const { db } = require('../utils/db');
const { assert } = require('superstruct');
const { CreateProductDto, UpdateProductDto } = require('../dtos/products.dto');

const validateCreateProduct = (req, res, next) => {
  try {
    assert(req.body, CreateProductDto);
    next();
  } catch (error) {
    console.error('Validation error for creating product:', error);
    res.status(400).json({ message: '상품 생성 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

const validateUpdateProduct = (req, res, next) => {
  try {
    assert(req.body, UpdateProductDto);
    next();
  } catch (error) {
    console.error('Validation error for updating product:', error);
    res.status(400).json({ message: '상품 수정 요청 데이터 형식이 올바르지 않습니다.' });
  }
};

router.route('/')
  .get(async (req, res) => {
    try {
      const products = await db.product.findMany();
      console.log(`Fetched products.`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: '상품 조회에 실패했습니다.' });
    }
  })
  .post(validateCreateProduct, async (req, res) => {
    try {
      const { name, description, price } = req.body;
      const newProduct = await db.product.create({ data: { name, description, price } });
      console.log(`Product created: ${newProduct.id}`);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
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
      const product = await db.product.findUnique({ where: { id: parsedId } });
      if (!product) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ message: '상품 조회에 실패했습니다.' });
    }
  })
  .patch(validateUpdateProduct, async (req, res) => {
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
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
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
    try {
      await db.product.delete({ where: { id: parsedId } });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '상품 삭제에 실패했습니다.' });
    }
  });

module.exports = router;