import { Request, Response, NextFunction, RequestHandler } from 'express';
import { create, StructError } from 'superstruct';
import BadRequestError from '../lib/errors/BadRequestError';

export function validate(
  type: 'body' | 'params' | 'query',
  schema: any
): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      req[type] = create(req[type], schema);
      next();
    } catch (err) {
      if (err instanceof StructError) {
        const messages = err.failures().map(failure => {
          return `${failure.path.join('.')} is ${failure.message}`;
        }).join(', ');
        return next(new BadRequestError(`Validation error: ${messages}`));
      }
      next(err);
    }
  };
}
