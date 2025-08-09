import validateRequest from "@/middleware/validateRequest";
import { Router } from "express";
import auth from "@/middleware/auth";
import submissionController from "./submission.controller";
import submissionValidator from "./submission.validator";

const submissionRouter = Router();

submissionRouter
  .route("/")
  .post(
    auth("STUDENT"),
    validateRequest(submissionValidator.createSubmissionSchema),
    submissionController.createSubmission,
  )
  .get(auth("STUDENT"), submissionController.getPaginatedSubmissions);
submissionRouter
  .route("/:id")
  .get(auth("STUDENT"), submissionController.getSubmissionById)
  .patch(
    auth("STUDENT"),
    validateRequest(submissionValidator.updateSubmissionSchema),
    submissionController.updateSubmission,
  )
  .delete(submissionController.deleteSubmission);

export default submissionRouter;
