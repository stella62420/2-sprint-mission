import { Router } from 'express';
import { withAsync } from '../lib/withAsync';
import { authenticateUser } from '../middleware/auth';
import {
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  getArticleList,
  createComment,
  getCommentList,
  addArticleLike,
  removeArticleLike,
} from '../articles/articlesController';

const router: Router = Router();

router.post('/', authenticateUser, withAsync(createArticle));
router.get('/', withAsync(getArticleList));
router.get('/:id', withAsync(getArticle));
router.patch('/:id', authenticateUser, withAsync(updateArticle));
router.delete('/:id', authenticateUser, withAsync(deleteArticle));

router.post('/:id/comments', authenticateUser, withAsync(createComment));
router.get('/:id/comments', withAsync(getCommentList));

router.post('/:id/like', authenticateUser, withAsync(addArticleLike));
router.delete('/:id/like', authenticateUser, withAsync(removeArticleLike));

export default router;
