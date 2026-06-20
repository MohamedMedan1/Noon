import type { NextFunction, Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";

export const uploadImageToCloud =
  (folderName: string, type?: "single" | "multi",fieldName?:string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
        return next();
      }

      if (type === "single" && req.file?.buffer) {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `noon/${folderName}` },
          (error, result) => {
            if (error) return next(error);
          
            fieldName? req.body[fieldName] = result?.secure_url : req.body.image = result?.secure_url;
            req.file!.cloudData = result?.public_id;
          
            return next();
          },
        );
        return stream.end(req.file.buffer);
      } else if (type === "multi" && req.files) {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        const mainImageArray = files.image || [];
        const subImagesArray = files.subImages || [];

        const allImages = [...mainImageArray, ...subImagesArray];
        req.body.subImages = [];
        req.body.subImagesPublicIds = [];

        const uploadPromises = allImages.map((img) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `noon/${folderName}` },
              (error, result) => {
                if (error) return reject(error);
                if (img.fieldname === "image") {
                  req.body.image = result?.secure_url;
                  req.files!.cloudData = result?.public_id;
                } else if (img.fieldname === "subImages") {
                  req.body.subImages.push(result?.secure_url);
                  req.body.subImagesPublicIds.push(result?.public_id);
                }
                resolve(result);
              },
            );
            stream.end(img.buffer);
          });
        });

        await Promise.all(uploadPromises);
        return next();
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
