import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import questionController from "./question.controller";
import questionValidator from "./question.validator";

const questionRouter = Router();

questionRouter
  .route("/")
  .post(
    validateRequest(questionValidator.createQuestionSchema),
    questionController.createQuestion,
  )
  .get(questionController.getPaginatedQuestions);
questionRouter
  .route("/:id")
  .get(questionController.getQuestionById)
  .patch(
    validateRequest(questionValidator.updateQuestionSchema),
    questionController.updateQuestion,
  )
  .delete(questionController.deleteQuestion);

export default questionRouter;
