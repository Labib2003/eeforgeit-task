import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { status as httpStatus } from "http-status";
import env from "@/config/env";
import authValidator from "./auth.validator";
import authController from "./auth.controller";

// Rate limiter configuration for generating OTP
const generateOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  limit: 3, // Limit each IP to 1 request per windowMs
  standardHeaders: "draft-8", // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, res) => {
    res.status(httpStatus.TOO_MANY_REQUESTS).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

const authRouter = Router();

authRouter.get(
  "/generate-otp",
  env.app.nodeEnv !== "development"
    ? generateOtpLimiter
    : (_req, _res, next) => next(),
  validateRequest(authValidator.generateOtpSchema),
  authController.generateOtp,
);
authRouter.post(
  "/login",
  validateRequest(authValidator.loginSchema),
  authController.login,
);

export default authRouter;
