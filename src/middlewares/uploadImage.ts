import multer,{type FileFilterCallback}  from "multer";
import type { Request } from "express";

const memoryStorage = multer.memoryStorage();

const filterImages = (req:Request,file:Express.Multer.File,cb:FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
  else {
    // We will handle this error later
  }
}


const upload = multer({ storage: memoryStorage, fileFilter: filterImages });
export const uploadImage = upload.single("image");