import { Router } from 'express';
import { withAsync } from '../lib/withAsync';
import {
  getMyInfo,
  updateMyInfo,
  changeMyPassword,
  getMyProducts,
  getLikedProducts,
  getLikedArticles,
} from '../users/userController';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  UpdateUserBodyStruct,
  ChangePasswordBodyStruct,
} from './userStruts';
import { GetProductListParamsStruct } from '../products/productsStruct';
import { GetArticleListParamsStruct } from '../articles/articlesStructs';

const userRouter: Router = Router();

userRouter.use(authenticateUser);

userRouter.get('/me', withAsync(getMyInfo));
userRouter.patch('/me', validate('body', UpdateUserBodyStruct), withAsync(updateMyInfo));
userRouter.patch('/me/password', validate('body', ChangePasswordBodyStruct), withAsync(changeMyPassword));

userRouter.get('/me/products', validate('query', GetProductListParamsStruct), withAsync(getMyProducts));

userRouter.get('/me/liked-products', validate('query', GetProductListParamsStruct), withAsync(getLikedProducts));

userRouter.get('/me/liked-articles', validate('query', GetArticleListParamsStruct), withAsync(getLikedArticles));

export default userRouter;
