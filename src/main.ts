import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { PORT, PUBLIC_PATH, STATIC_PATH } from './lib/constants';
import articlesRouter from './articles/articlesRouter'; 
import productsRouter from './products/productsRouter';
import commentsRouter from './comments/commentsRouter'; 
import imagesRouter from './images/imagesRouter';  
import authRouter from './auth/authRouter';          
import userRouter from './users/userRouter'; 
import { errorHandler, defaultNotFoundHandler } from './lib/errorController';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/images', imagesRouter);
app.use('/comments', commentsRouter);

app.use(defaultNotFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
