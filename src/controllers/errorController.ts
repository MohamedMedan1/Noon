import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.js";
import prismaErrors from "../config/prismaErrors.json" with { type: "json" };

interface IError extends Error {
  message: string;
  status: string;
  statusCode: number;
  isOperational?: boolean;
  code?: number;
}

const handleTokenValidationError = () => new AppError("Invalid Token", 401);

const handleTokenExpiredError = () =>
  new AppError("Token was expired please, log in", 401);

const handleZodErrors = (errors: ZodError) => {
  const messages = errors.issues.map((cur: any) => cur["message"]).join(",");
  return new AppError(messages, 400);
};

const handlePrismaErrors = (error: PrismaClientKnownRequestError) => {
  const { statusCode, message } = (prismaErrors as Record<string, any>)[
    error.code
  ] || {};
  if (!statusCode && !message) {
    return new AppError("Something went very wrong",500);
  }
  return new AppError(message, statusCode);
};

const handleDevelopmentErrors = (res: Response, error: IError) => {
  res.status(error.statusCode).json({
    status: error.status,
    stack: error.stack,
    message: error.message,
  });
};

const handleProductionErrors = (res: Response, error: IError) => {
  const { status, statusCode, message, isOperational } = error;
  if (isOperational) {
    res.status(statusCode).json({
      status,
      message,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong !",
    });
  }
};

export const GlobalErrorHandler = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (error instanceof ZodError) error = handleZodErrors(error);
  if (error instanceof PrismaClientKnownRequestError)
    error = handlePrismaErrors(error);
  if (error.name === "JsonWebTokenError") error = handleTokenValidationError();
  if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

  if (process.env.NODE_ENV === "development") {
    handleDevelopmentErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    handleProductionErrors(res, error);
  }
};
