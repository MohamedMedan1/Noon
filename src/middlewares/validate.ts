import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type RequestSchema = z.ZodObject<{
  body: z.ZodTypeAny;
  params: z.ZodTypeAny;
  query: z.ZodTypeAny;
}>;

export const validate = <T extends RequestSchema>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!validation.success) {
      res.status(400).json({
        status: 'Error',
        message: validation.error.issues[0]?.message ?? 'Invalid request data',
      });
      return;
    }

    req.body = validation.data.body;
    req.params = validation.data.params as typeof req.params;
      next();
  };
};
