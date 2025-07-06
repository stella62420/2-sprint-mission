import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductList,
  createComment,
  getCommentList,
  addProductLike, 
  removeProductLike, 
} from '../products/productsController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  UpdateProductBodyStruct,
  GetProductListParamsStruct,
  CreateProductBodyStruct,
} from '../products/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../comments/commentsStruct.js';
import { IdParamsStruct } from '../lib/commonStructs.js';
import { optionalAuthenticateUser } from '../middleware/auth.js';

const productsRouter = express.Router();


productsRouter.post('/', authenticateUser, validate( 'body', CreateProductBodyStruct),optionalAuthenticateUser, withAsync(createProduct));
productsRouter.get('/:id', validate('params', IdParamsStruct), authenticateUser, withAsync(getProduct)); 
productsRouter.patch('/:id', authenticateUser, validate('params', IdParamsStruct), validate('body', UpdateProductBodyStruct), withAsync(updateProduct));
productsRouter.delete('/:id', authenticateUser, validate('params', IdParamsStruct), withAsync(deleteProduct));
productsRouter.get('/', validate('query', GetProductListParamsStruct), authenticateUser, withAsync(getProductList));
productsRouter.post('/:id/comments', authenticateUser, validate('params', IdParamsStruct), validate('body', CreateCommentBodyStruct), withAsync(createComment));
productsRouter.get('/:id/comments', validate('params', IdParamsStruct), validate('query', GetCommentListParamsStruct), withAsync(getCommentList));

productsRouter.post('/:id/likes', authenticateUser, validate('params', IdParamsStruct), withAsync(addProductLike));
productsRouter.delete('/:id/likes', authenticateUser, validate('params', IdParamsStruct), withAsync(removeProductLike));
export default productsRouter;