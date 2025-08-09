import { Router } from "express";
import validateRequest from "@/middleware/validateRequest";
import configController from "./config.controller";
import configValidator from "./config.validator";

const configRouter = Router();

configRouter
  .route("/")
  .get(configController.getConfig)
  .patch(
    validateRequest(configValidator.updateConfigSchema),
    configController.updateConfig,
  );

export default configRouter;
