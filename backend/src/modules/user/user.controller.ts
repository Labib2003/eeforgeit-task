import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
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
  const filters = pick(req.query, ["search", "step", "level"]);
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

  const response = await userService.updateUser(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User updated successfully",
    data: response,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const response = await userService.deleteUser(id);

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
