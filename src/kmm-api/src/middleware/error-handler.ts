// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export default function errorHandler(
  err: ApiError,
  _: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err); // Replace with logger if needed

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message, status });
}