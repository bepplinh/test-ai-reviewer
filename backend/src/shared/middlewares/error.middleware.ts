import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Centralized error handling middleware.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(
    {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled error'
  );

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
}
