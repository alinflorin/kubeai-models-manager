import type { Request, Response, NextFunction } from 'express';
import type { ErrorDto } from '../models/error.dto';

export interface ApiError extends Error {
  status?: number;
}

export default function errorHandlerMiddleware(
  err: ApiError,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __: NextFunction
) {
  console.error(err); // Replace with logger if needed

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    "": [message]
  } as ErrorDto);
}