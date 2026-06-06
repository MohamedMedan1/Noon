import type { NextFunction, Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";

export const uploadImageToCloud =
  (folderName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file || !req.file.buffer) return next();

    const resultOfCloudCall = cloudinary.uploader.upload_stream(
      { folder: `noon/${folderName}` },
      (error, result) => {
        if (error) return next(error);
        req.body.image = result?.secure_url;
        req.file.cloudData = result?.public_id;
        return next();
      },
    );

    resultOfCloudCall.end(req.file.buffer);
  };
