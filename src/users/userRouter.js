import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  getMyInfo,
  updateMyInfo,
  changeMyPassword,
  getMyProducts,
  getLikedProducts,
  getLikedArticles,
} from '../users/userController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { UpdateUserBodyStruct, ChangePasswordBodyStruct } from './userStruts.js';
import { GetProductListParamsStruct } from '../products/productsStruct.js';
import { GetArticleListParamsStruct } from '../articles/articlesStructs.js';

const userRouter = express.Router();

userRouter.use(authenticateUser);

userRouter.get('/me', withAsync(getMyInfo));
userRouter.patch('/me', validate('body', UpdateUserBodyStruct), withAsync(updateMyInfo));
userRouter.patch(
  '/me/password',
  validate('body', ChangePasswordBodyStruct),
  withAsync(changeMyPassword),
);
userRouter.get('/me/products', validate('query', GetProductListParamsStruct), withAsync(getMyProducts));
userRouter.get('/me/liked-products', validate('query', GetProductListParamsStruct), withAsync(getLikedProducts));
userRouter.get('/me/liked-articles', validate('query', GetArticleListParamsStruct), withAsync(getLikedArticles));

export default userRouter;