import type { Request, Response, NextFunction } from 'express';
import type { ErrorDto } from '../models/error.dto';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function notFoundMiddleware(req: Request, res: Response, _: NextFunction) {
  res.status(404).json({
    "": [req.originalUrl + " not found"]
  } as ErrorDto);
}