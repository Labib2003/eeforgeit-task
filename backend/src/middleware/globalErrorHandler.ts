import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import ApiError from "@/utils/ApiError";
import env from "@/config/env";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library";
import { status as httpStatus } from "http-status";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.log(`[APP ERROR]`, {
    endpoint: req.url,
    method: req.method,
    payload: JSON.stringify(req.body),
    headers: req.headers,
    error,
  });

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let errors: unknown[] | undefined;

  if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error.message;
  } else if (error instanceof PrismaClientKnownRequestError) {
    message = error.name;
  } else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation error";
    errors = error.errors.map((e) => ({ path: e.path, error: e.message }));
  } else if (error instanceof Error) {
    message = error?.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: env.app.nodeEnv === "development" ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
