import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import userController from "./user.controller";
import userValidator from "./user.validator";

const userRouter = Router();

userRouter
  .route("/")
  .post(
    validateRequest(userValidator.createUserSchema),
    userController.createUser,
  )
  .get(userController.getPaginatedUsers);
userRouter
  .route("/:id")
  .get(userController.getUserById)
  .patch(
    validateRequest(userValidator.updateUserSchema),
    userController.updateUser,
  )
  .delete(userController.deleteUser);

export default userRouter;
