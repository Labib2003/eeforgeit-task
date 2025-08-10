import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import auth from "@/middleware/auth";
import userController from "./user.controller";
import userValidator from "./user.validator";

const userRouter = Router();

userRouter
  .route("/")
  .post(
    auth("ADMIN"),
    validateRequest(userValidator.createUserSchema),
    userController.createUser,
  )
  .get(auth("ADMIN"), userController.getPaginatedUsers);
userRouter
  .route("/:id")
  .get(auth("ADMIN"), userController.getUserById)
  .patch(
    auth("ADMIN", "STUDENT", "SUPERVISOR"),
    validateRequest(userValidator.updateUserSchema),
    userController.updateUser,
  )
  .delete(auth("ADMIN"), userController.deleteUser);

export default userRouter;
