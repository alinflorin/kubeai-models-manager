// src/middleware/notFoundHandler.ts
import { Request, Response, NextFunction } from 'express';

export default function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    error: {
      message: `${req.originalUrl} not found`,
      status: 404,
    },
  });
}