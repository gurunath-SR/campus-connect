import type { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
    return;
  }
  next();
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: number; keyValue?: Record<string, unknown> },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `An entry with this ${duplicateField} already exists.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
