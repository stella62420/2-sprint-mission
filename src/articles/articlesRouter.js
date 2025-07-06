import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  createArticle,
  getArticleList,
  getArticle,
  updateArticle,
  deleteArticle,
  createComment,
  getCommentList,
  addArticleLike,
  removeArticleLike, 
} from '../articles/articlesController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../articles/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../comments/commentsStruct.js';
import { IdParamsStruct } from '../lib/commonStructs.js';
import { optionalAuthenticateUser } from '../middleware/auth.js';

const articlesRouter = express.Router();

articlesRouter.post('/', authenticateUser, validate('body', CreateArticleBodyStruct), withAsync(createArticle));
articlesRouter.get('/', validate('query', GetArticleListParamsStruct),optionalAuthenticateUser, withAsync(getArticleList));
articlesRouter.get('/:id', validate('params', IdParamsStruct), authenticateUser, withAsync(getArticle));
articlesRouter.patch('/:id', authenticateUser, validate('params', IdParamsStruct), validate('body', UpdateArticleBodyStruct), withAsync(updateArticle));
articlesRouter.delete('/:id', authenticateUser, validate('params', IdParamsStruct), withAsync(deleteArticle));

articlesRouter.post('/:id/comments', authenticateUser, validate('params', IdParamsStruct), validate('body', CreateCommentBodyStruct), withAsync(createComment));
articlesRouter.get('/:id/comments', validate('params', IdParamsStruct), validate('query', GetCommentListParamsStruct), withAsync(getCommentList));


articlesRouter.post('/:id/likes', authenticateUser, validate('params', IdParamsStruct), withAsync(addArticleLike)); 
articlesRouter.delete('/:id/likes', authenticateUser, validate('params', IdParamsStruct), withAsync(removeArticleLike)); 


export default articlesRouter;