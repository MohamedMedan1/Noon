import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validation = schema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        status: 'Error',
        message: validation.error.issues[0]?.message ?? 'Invalid request data',
      });
      return;
    }

    req.body = validation.data;
    next();
  };
};