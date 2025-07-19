import { Request, Response, NextFunction, RequestHandler } from 'express';

export function withAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return async function (req, res, next) {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
