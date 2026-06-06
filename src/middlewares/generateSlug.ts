import slugify from "slugify";
import type { NextFunction, Request, Response } from "express";

export const generateSlug = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.name) {
    const slug = slugify(req.body.name, {
      lower: true,
      strict: true,
      trim: true,
    });
    req.body.slug = slug;
  }
  next();
};
