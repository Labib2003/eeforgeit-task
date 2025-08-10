import env from "@/config/env";
import prisma from "@/config/prisma";
import { Role } from "@/generated/prisma";
import ApiError from "@/utils/ApiError.js";
import { RequestHandler } from "express";
import { status as httpStatus } from "http-status";
import jwt from "jsonwebtoken";

const auth = (...authorizedRoles: Role[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        res.locals.user = null;
        throw new ApiError(httpStatus.UNAUTHORIZED, "Access token is required");
      }

      let decoded: jwt.JwtPayload | undefined;
      if (accessToken) {
        decoded = jwt.verify(
          accessToken,
          env.jwt.accessTokenSecret,
        ) as jwt.JwtPayload;

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
        if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

        if (!authorizedRoles.includes(user.role))
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "You do not have permission to access this resource",
          );

        res.locals.user = user;
        next();
        return;
      }

      const { refreshToken } = req.cookies;
      if (!refreshToken)
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Refresh token is required",
        );

      try {
        const payload = jwt.verify(
          refreshToken,
          env.jwt.refreshTokenSecret,
        ) as jwt.JwtPayload;

        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });
        if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

        if (!authorizedRoles.includes(user.role))
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "You do not have permission to access this resource",
          );

        const newAccessToken = jwt.sign(
          { id: payload.id },
          env.jwt.accessTokenSecret,
          {
            expiresIn: "1m",
          },
        );

        res.locals.user = payload;
        res.locals.accessToken = newAccessToken;

        next();
      } catch {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Invalid refresh token, re-authenticate",
        );
      }
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
