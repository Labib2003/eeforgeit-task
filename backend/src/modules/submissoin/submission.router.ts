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
  .get(
    auth("ADMIN", "SUPERVISOR", "STUDENT"),
    submissionController.getPaginatedSubmissions,
  );
submissionRouter
  .route("/:id")
  .get(auth("ADMIN"), submissionController.getSubmissionById)
  .patch(
    auth("STUDENT", "SUPERVISOR"),
    validateRequest(submissionValidator.updateSubmissionSchema),
    submissionController.updateSubmission,
  )
  .delete(auth("SUPERVISOR", "ADMIN"), submissionController.deleteSubmission);
submissionRouter
  .route("/:id/certificate")
  .get(auth("STUDENT"), submissionController.sendCertificate);

export default submissionRouter;
