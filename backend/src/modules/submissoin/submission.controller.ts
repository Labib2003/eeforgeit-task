import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
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

  const response = await submissionService.getSubmissionById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission fetched successfully",
    data: response,
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

  const response = await submissionService.updateSubmission(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission updated successfully",
    data: response,
  });
});

const deleteSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;

  const response = await submissionService.deleteSubmission(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission deleted successfully",
    data: response,
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
