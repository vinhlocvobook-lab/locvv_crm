import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'ERR_INTERNAL_SERVER';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
