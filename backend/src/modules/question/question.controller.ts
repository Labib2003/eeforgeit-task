import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
import questionService from "./question.service";

const createQuestion = catchAsync(async (req, res) => {
  const data = req.body;

  const response = await questionService.createQuestion(data);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Question created successfully",
    data: response,
  });
});

const getQuestionById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const response = await questionService.getQuestionById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Question fetched successfully",
    data: response,
  });
});

const getPaginatedQuestions = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["search", "step", "level", "competency"]);
  const options = pick(req.query, ["sort_by", "sort_order", "limit", "page"]);
  const newAccessToken = res.locals.accessToken;

  const response = await questionService.getPaginatedQuestions(
    filters,
    options,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Questions fetched successfully",
    data: response,
    newAccessToken,
  });
});

const updateQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const response = await questionService.updateQuestion(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Question updated successfully",
    data: response,
  });
});

const deleteQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;

  const response = await questionService.deleteQuestion(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Question deleted successfully",
    data: response,
  });
});

const questionController = {
  createQuestion,
  getQuestionById,
  getPaginatedQuestions,
  updateQuestion,
  deleteQuestion,
};
export default questionController;
