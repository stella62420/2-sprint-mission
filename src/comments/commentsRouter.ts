import express from 'express';
import { withAsync } from '../lib/withAsync';
import { updateComment, deleteComment } from '../comments/commentsController';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UpdateCommentBodyStruct } from '../comments/commentsStruct';
import { IdParamsStruct } from '../lib/commonStructs';

const commentsRouter = express.Router();


commentsRouter.patch('/:id', authenticateUser, validate('params', IdParamsStruct), validate('body', UpdateCommentBodyStruct), withAsync(updateComment));
commentsRouter.delete('/:id', authenticateUser, validate('params', IdParamsStruct), withAsync(deleteComment));

export default commentsRouter;