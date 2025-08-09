import catchAsync from "@/utils/catchAsync";
import { status as httpStatus } from "http-status";
import configService from "./config.service";

const getConfig = catchAsync(async (_req, res) => {
  const response = await configService.getConfig();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Config retrieved successfully",
    data: response,
  });
});

const updateConfig = catchAsync(async (req, res) => {
  const response = await configService.updateConfig(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Config updated successfully",
    data: response,
  });
});

const configController = {
  getConfig,
  updateConfig,
};
export default configController;
