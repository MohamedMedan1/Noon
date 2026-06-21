import type { NextFunction, Request, Response } from "express";
import { type ZodObject, ZodError } from "zod";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body || {},
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
