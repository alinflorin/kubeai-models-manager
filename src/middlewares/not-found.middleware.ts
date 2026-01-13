import type { Request, Response, NextFunction } from 'express';
import type { ErrorDto } from '../models/error.dto';

export default function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.toLowerCase().startsWith('/api/') && !req.path.toLowerCase().startsWith('/public/api/')) {
    next();
    return;
  }

  res.status(404).json({
    "": [req.originalUrl + " not found"]
  } as ErrorDto);
}