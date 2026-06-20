import type { NextFunction, Request, Response } from "express";
import { type ZodObject, ZodError } from "zod";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "Fail",
          errors: error.issues.map((err) => ({
            field: err.path[1] || err.path[0],
            message: err.message,
          })),
        });
        return;
      }

      return next(error);
    }
  };
