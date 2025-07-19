import express from 'express';
import { withAsync } from '../lib/withAsync';
import { register, login, refreshAccessToken } from '../auth/authController';
import { validate } from '../middleware/validation';
import { RegisterBodyStruct, LoginBodyStruct } from '../auth/authStructs';

const authRouter = express.Router();

authRouter.post('/register', validate('body', RegisterBodyStruct), withAsync(register));
authRouter.post('/login', validate('body', LoginBodyStruct), withAsync(login));
authRouter.post('/refresh', withAsync(refreshAccessToken));

export default authRouter;