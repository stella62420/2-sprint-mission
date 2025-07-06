import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, PUBLIC_PATH, STATIC_PATH } from './lib/constants.js';
import articlesRouter from './articles/articlesRouter.js'; 
import productsRouter from './products/productsRouter.js';
import commentsRouter from './comments/commentsRouter.js'; 
import imagesRouter from './images/imagesRouter.js';  
import authRouter from './auth/authRouter.js';          
import userRouter from './users/userRouter.js'; 
import { defaultNotFoundHandler, globalErrorHandler } from './lib/errorController.js';


const app = express();

app.use(cors());
app.use(express.json());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);
app.use('/images', imagesRouter);
app.use('/auth', authRouter); 
app.use('/users', userRouter); 

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});