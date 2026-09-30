import type { NextFunction, Request, Response } from 'express';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'File is too large' });
  res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Internal server error' });
}
