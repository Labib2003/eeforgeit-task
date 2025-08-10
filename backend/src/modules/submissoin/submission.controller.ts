import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
import ApiError from "@/utils/ApiError";
import { EvaluationLevel } from "@/generated/prisma";
import submissionService from "./submission.service";

const createSubmission = catchAsync(async (req, res) => {
  const data = req.body;
  data.submittedById = res.locals.user.id;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.createSubmission(data);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Submission created successfully",
    data: response,
    newAccessToken,
  });
});

const getSubmissionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.getSubmissionById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission fetched successfully",
    data: response,
    newAccessToken,
  });
});

const getPaginatedSubmissions = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["search", "step", "level"]);
  const options = pick(req.query, ["sort_by", "sort_order", "limit", "page"]);
  const newAccessToken = res.locals.accessToken;

  if (res.locals.user.role === "STUDENT")
    filters.submittedById = res.locals.user.id;

  const response = await submissionService.getPaginatedSubmissions(
    filters,
    options,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submissions fetched successfully",
    data: response,
    newAccessToken,
  });
});

const updateSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const newAccessToken = res.locals.accessToken;

  const submission = await submissionService.getSubmissionById(id);
  if (!submission)
    throw new ApiError(httpStatus.NOT_FOUND, "Submission not found");
  if (
    res.locals.user.role === "STUDENT" &&
    (submission.submittedById !== res.locals.user.id ||
      data.questionsAndAnswers?.find((q: Record<string, unknown>) => q.correct))
  )
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this submission",
    );
  if (res.locals.user.role === "SUPERVISOR") {
    data.examinedById = res.locals.user.id;

    // Use the incoming QA list if provided; otherwise fall back to current
    const qa: Array<{ correct?: boolean }> =
      (data.questionsAndAnswers as any[]) ??
      (submission.questionsAndAnswers as any[]);

    const total = qa.length || 0;
    const correctCount = qa.reduce(
      (acc, cur) => (cur?.correct ? acc + 1 : acc),
      0,
    );
    const pct = total ? (correctCount / total) * 100 : 0;

    let level: EvaluationLevel;
    if (pct < 25) {
      level = EvaluationLevel.FAIL;
    } else if (pct < 50) {
      level = EvaluationLevel.ONE;
    } else if (pct < 75) {
      level = EvaluationLevel.TWO;
    } else {
      level = EvaluationLevel.THREE;
    }

    data.level = level;
  }

  const response = await submissionService.updateSubmission(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission updated successfully",
    data: response,
    newAccessToken,
  });
});

const deleteSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.deleteSubmission(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission deleted successfully",
    data: response,
    newAccessToken,
  });
});

const submissionController = {
  createSubmission,
  getSubmissionById,
  getPaginatedSubmissions,
  updateSubmission,
  deleteSubmission,
};
export default submissionController;
