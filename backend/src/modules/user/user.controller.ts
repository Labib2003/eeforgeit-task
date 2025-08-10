import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library";
import ApiError from "@/utils/ApiError";
import userService from "./user.service";

const createUser = catchAsync(async (req, res) => {
  const data = req.body;

  const response = await userService.createUser(data);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User created successfully",
    data: response,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const response = await userService.getUserById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: response,
  });
});

const getPaginatedUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["search", "role"]);
  const options = pick(req.query, ["sort_by", "sort_order", "limit", "page"]);
  const newAccessToken = res.locals.accessToken;

  const response = await userService.getPaginatedUsers(filters, options);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: response,
    newAccessToken,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const user = await userService.getUserById(id);
  if (res.locals.user.role === "STUDENT" && user?.id !== res.locals.user.id)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this user",
    );

  const response = await userService.updateUser(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User updated successfully",
    data: response,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  let response;
  try {
    response = await userService.deleteUser(id);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User cannot be deleted as it is associated with other records",
      );
    throw error;
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: "User deleted successfully",
    data: response,
  });
});

const userController = {
  createUser,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser,
};
export default userController;
