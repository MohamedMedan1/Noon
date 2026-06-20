import { Request } from "express";

// Extend the Express Request interface
declare module "express-serve-static-core" {
  interface Request {
    file: cloudData;
    files: cloudData;
    user?: {
      id: string;
      role: string;
        id: string;
        email: string;
        name: string | null;
        role: string;
    };
  }
}
