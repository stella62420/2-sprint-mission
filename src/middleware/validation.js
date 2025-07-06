import { create, StructError } from 'superstruct';
import BadRequestError from '../lib/errors/BadRequestError.js';

export function validate(type, schema) {
  return function (req, res, next) {
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