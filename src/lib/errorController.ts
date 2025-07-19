import { Request, Response, NextFunction } from 'express';
import BadRequestError from './errors/BadRequestError';
import NotFoundError from './errors/NotFoundError';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err); 

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
  });
  
}

export function defaultNotFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found' });
}

