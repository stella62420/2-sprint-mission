import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import { register, login, refreshAccessToken } from '../auth/authController.js';
import { validate } from '../middleware/validation.js';
import { RegisterBodyStruct, LoginBodyStruct } from '../auth/authStructs.js';

const authRouter = express.Router();

authRouter.post('/register', validate('body', RegisterBodyStruct), withAsync(register));
authRouter.post('/login', validate('body', LoginBodyStruct), withAsync(login));
authRouter.post('/refresh', withAsync(refreshAccessToken));

export default authRouter;