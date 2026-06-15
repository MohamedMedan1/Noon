import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const memoryStorage = multer.memoryStorage();

const filterImages = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedExtensions = ["png", "jpeg", "jfif", "jpg"];
  const fileExtension = String(file.originalname.split(".")[1]).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    // We will handle this error later
  }
};

const upload = multer({ storage: memoryStorage, fileFilter: filterImages });
export const uploadMulter = (type: "single" | "fields") =>
  type === "single"
    ? upload.single("image")
    : upload.fields([
        { name: "image", maxCount: 1 },
        { name: "subImages", maxCount: 4 },
      ]);
