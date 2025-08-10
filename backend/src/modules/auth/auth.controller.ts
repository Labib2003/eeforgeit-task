import env from "@/config/env";
import ApiError from "@/utils/ApiError";
import catchAsync from "@/utils/catchAsync";
import { status as httpStatus } from "http-status";
import prisma from "@/config/prisma";
import { User } from "@/generated/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateOtp = catchAsync(async (req, res) => {
  const { email } = req.query;

  if (email && typeof email !== "string")
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid phone or email format");

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email: email! },
    });
  }

  const otp = `${Math.floor(10000 + Math.random() * 90000)}`;
  const hashedOtp = await bcrypt.hash(otp, 10);

  // TODO: Send OTP

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: hashedOtp,
      otpExpiresAt: new Date(Date.now() + 3 * 60 * 1000), // expires in 3 mins
    },
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "OTP generated successfully",
    data: { otp },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, active: true },
    omit: {
      otp: false,
      otpExpiresAt: false,
      failedOtpAttempts: false,
      lockedUntil: false,
    },
  });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  // Check if account is currently locked
  if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Too many failed attempts. Try again later.",
    );
  }

  // Update this employee if not locked - reset failedOtpAttempts attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedOtpAttempts: 0,
      lockedUntil: null,
    },
  });

  // Check if OTP is expired
  if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP expired");
  }

  // Verify OTP
  const passwordMatch = await bcrypt.compare(otp, user.otp ?? "");

  if (!passwordMatch) {
    // Increment the failed attempts counter
    const failedAttempts = user.failedOtpAttempts + 1;
    const updateData: Partial<User> = { failedOtpAttempts: failedAttempts };

    // If threshold is exceeded, set lockUntil (e.g., lock for 10 minutes)
    if (failedAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw new ApiError(httpStatus.NOT_FOUND, "Invalid credentials");
  }

  // On successful OTP verification, reset the counters and clear OTP fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: null,
      otpExpiresAt: null,
      failedOtpAttempts: 0,
      lockedUntil: null,
    },
  });

  // Generate session token and create new session
  const accessToken = jwt.sign({ id: user.id }, env.jwt.accessTokenSecret, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshTokenSecret, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.app.nodeEnv !== "development", // Set secure flag in production
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      },
    },
  });
});

const authController = {
  generateOtp,
  login,
};
export default authController;
