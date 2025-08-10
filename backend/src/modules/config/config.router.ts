import { Router } from "express";
import validateRequest from "@/middleware/validateRequest";
import auth from "@/middleware/auth";
import configController from "./config.controller";
import configValidator from "./config.validator";

const configRouter = Router();

configRouter
  .route("/")
  .get(auth("ADMIN", "SUPERVISOR", "STUDENT"), configController.getConfig)
  .patch(
    auth("ADMIN"),
    validateRequest(configValidator.updateConfigSchema),
    configController.updateConfig,
  );

export default configRouter;
