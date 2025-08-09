import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import auth from "@/middleware/auth";
import questionController from "./question.controller";
import questionValidator from "./question.validator";

const questionRouter = Router();

questionRouter
  .route("/")
  .post(
    validateRequest(questionValidator.createQuestionSchema),
    questionController.createQuestion,
  )
  .get(auth("STUDENT"), questionController.getPaginatedQuestions);
questionRouter
  .route("/:id")
  .get(questionController.getQuestionById)
  .patch(
    validateRequest(questionValidator.updateQuestionSchema),
    questionController.updateQuestion,
  )
  .delete(questionController.deleteQuestion);

export default questionRouter;
