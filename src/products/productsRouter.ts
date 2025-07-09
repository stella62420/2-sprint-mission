import express from 'express';
import { withAsync } from '../lib/withAsync';
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
} from '../products/productsController';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  UpdateProductBodyStruct,
  GetProductListParamsStruct,
  CreateProductBodyStruct,
} from '../products/productsStruct';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../comments/commentsStruct';
import { IdParamsStruct } from '../lib/commonStructs';
import { optionalAuthenticateUser } from '../middleware/auth';

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