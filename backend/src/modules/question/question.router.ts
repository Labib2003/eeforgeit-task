import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import auth from "@/middleware/auth";
import questionController from "./question.controller";
import questionValidator from "./question.validator";

const questionRouter = Router();

questionRouter
  .route("/")
  .post(
    auth("ADMIN"),
    validateRequest(questionValidator.createQuestionSchema),
    questionController.createQuestion,
  )
  .get(auth("ADMIN", "STUDENT"), questionController.getPaginatedQuestions);
questionRouter
  .route("/:id")
  .get(auth("ADMIN"), questionController.getQuestionById)
  .patch(
    auth("ADMIN"),
    validateRequest(questionValidator.updateQuestionSchema),
    questionController.updateQuestion,
  )
  .delete(questionController.deleteQuestion);

export default questionRouter;
