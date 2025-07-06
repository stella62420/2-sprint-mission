import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import { updateComment, deleteComment } from '../comments/commentsController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { UpdateCommentBodyStruct } from '../comments/commentsStruct.js';
import { IdParamsStruct } from '../lib/commonStructs.js';

const commentsRouter = express.Router();


commentsRouter.patch('/:id', authenticateUser, validate('params', IdParamsStruct), validate('body', UpdateCommentBodyStruct), withAsync(updateComment));
commentsRouter.delete('/:id', authenticateUser, validate('params', IdParamsStruct), withAsync(deleteComment));

export default commentsRouter;